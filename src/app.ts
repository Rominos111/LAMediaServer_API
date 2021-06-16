import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import rateLimiter from "express-rate-limit";
import rateSlower from "express-slow-down";
import walk from "fs-walk";
import {APIResponse} from "helper/APIResponse";
import {envConfig} from "helper/envConfig";
import http from "http";
import createError from "http-errors";
import logger from "morgan";
import path from "path";

const app = express();
const server = http.createServer(app);

envConfig.config();

//======================================================================================================================
// Configuration des middlewares
//======================================================================================================================

// Proxy renversé
if (process.env.REVERSE_PROXY !== undefined && ["1", "true"].includes(process.env.REVERSE_PROXY.toLowerCase())) {
    app.enable("trust proxy");
}

const corsOptions: cors.CorsOptions = {
    allowedHeaders: [
        "Accept",
        "Authorization",
        "Content-Type",
        "Origin",
    ],
    credentials: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    origin: "*",
    preflightContinue: false,
};

// CORS
app.use(cors(corsOptions));

// Logs
if (process.env.RELEASE_ENVIRONMENT === "dev") {
    app.use(logger("dev"));
} else {
    console.debug = (..._: any[]) => undefined;
    app.use(logger("short"));
}

// Requêtes en JSON
app.use(bodyParser.json())

// JSON
app.use(express.json());
app.use(express.urlencoded({extended: false}));

if (process.env.RELEASE_ENVIRONMENT !== "dev") {
    // Limite de requêtes, va renvoyer des erreurs 429 après une limit de requêtes.
    const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS as string);
    const RATE_LIMIT_MAX_DELAY = parseInt(process.env.RATE_LIMIT_MAX_DELAY as string);
    const RATE_LIMIT_DELAY_INCREMENT = parseInt(process.env.RATE_LIMIT_DELAY_INCREMENT as string);
    const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW as string) * 1000;

    app.use(rateLimiter({
        max: RATE_LIMIT_MAX_REQUESTS + (RATE_LIMIT_MAX_DELAY / RATE_LIMIT_DELAY_INCREMENT),
        windowMs: RATE_LIMIT_WINDOW,
        message: JSON.stringify(
            APIResponse
                .fromFailure("Too many requests, please try again later.", 429, null, "access")
                .getRaw()
        ),
        headers: true,
        draft_polli_ratelimit_headers: true,
    }));

    // Limite de requêtes, va ralentir chaque requête au delà de 100 sur 2 minutes,
    //  en ajoutant 100 ms de latence par requête supplémentaire, avec comme maximum 1 seconde de latence
    app.use(rateSlower({
        windowMs: RATE_LIMIT_WINDOW,
        delayAfter: RATE_LIMIT_MAX_REQUESTS,
        delayMs: RATE_LIMIT_DELAY_INCREMENT,
        maxDelayMs: RATE_LIMIT_MAX_DELAY,
        // @ts-ignore
        headers: true,
    }));
}

//======================================================================================================================
// Configuration des routes
//======================================================================================================================

const routesPathRelative = "routes";
const routesPath = path.join(__dirname, routesPathRelative);

let importedRoutes: { route: string, path: string }[] = [];

walk.filesSync(routesPath, (basedir, filename, _stat, _next) => {
    if (/^index\.[tj]s$/.test(filename)) {
        filename = "";
    }

    filename = filename.replace(/\.[jt]s$/, "");
    let route = '/' + path.relative(routesPath, path.join(basedir, filename)).replace(/\\/g, '/');
    importedRoutes.push({
        route: route,
        path: path.join(basedir, filename)
    });
}, (err) => {
    if (err) {
        console.error(err);
    }
});

for (let importedRoute of importedRoutes) {
    app.use(importedRoute.route, require(importedRoute.path));
}

// Redirige les 404 vers la gestion des erreurs
app.use((_req, _res, next) => {
    next(createError(404));
});

// Gestion des erreurs
app.use((err, _req, res, _next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.RELEASE_ENVIRONMENT === "dev" ? err : {};

    let response: APIResponse;

    if (err.message) {
        // Erreur express, comme un 404, ou erreur plus générale
        response = APIResponse.fromFailure(err.message, err.statusCode || 500, null, "access");
    } else if (err.error) {
        // Erreur de validation JOI
        let error: { message: string, key: string } = {
            message: "?",
            key: "?"
        };

        for (const validationError of err.error.details) {
            console.debug("Validation error. type:", validationError.type, "key:", validationError.context.key);
            error = {
                "message": validationError.message,
                "key": validationError.context.key,  // TODO: Gérer le champ erroné ?
            };
        }

        response = APIResponse.fromFailure(error.message, 400, null, "validation");
    } else {
        console.debug(err);
        response = APIResponse.fromFailure("?", 500, null, "unknown");
    }

    response.send(res);
});

// @ts-ignore
app.options("*", cors(corsOptions));

server.listen(process.env.SERVER_PORT, () => {
    console.info(`Server is now listening on port ${process.env.SERVER_PORT}...`);
});
