import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import rateLimiter from "express-rate-limit";
import rateSlower from "express-slow-down";
import expressWs from "express-ws";
import walk from "fs-walk";
import {APIResponse} from "helper/APIResponse";
import {envConfig} from "helper/envConfig";
import {HTTPStatus} from "helper/requestMethod";
import createError from "http-errors";
import morgan from "morgan";
import path from "path";

const expressWsInstance = expressWs(express());
const app = expressWsInstance.app;

envConfig.config();

//======================================================================================================================
// Configuration des middlewares
//======================================================================================================================

// Proxy renversé
if (process.env.hasOwnProperty("REVERSE_PROXY")
    && ["1", "true"].includes((process.env.REVERSE_PROXY as string).toLowerCase())) {
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
    methods: "GET,PUT,PATCH,POST,DELETE",
    origin: "*",
    preflightContinue: false,
};

// CORS
app.use(cors(corsOptions));

// Logs
if (process.env.RELEASE_ENVIRONMENT === "dev") {
    app.use(morgan("dev"));
} else {
    console.debug = () => void null;
    app.use(morgan("short"));
}

// Requêtes en JSON
app.use(bodyParser.json());

// JSON
app.use(bodyParser.urlencoded({extended: true}));

if (process.env.RELEASE_ENVIRONMENT !== "dev") {
    // Limite de requêtes, va renvoyer des erreurs 429 après une limit de requêtes.
    const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS as string);
    const RATE_LIMIT_MAX_DELAY = parseInt(process.env.RATE_LIMIT_MAX_DELAY as string);
    const RATE_LIMIT_DELAY_INCREMENT = parseInt(process.env.RATE_LIMIT_DELAY_INCREMENT as string);
    const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW as string) * 1000;

    app.use(rateLimiter({
        draft_polli_ratelimit_headers: true,
        headers: true,
        max: RATE_LIMIT_MAX_REQUESTS + (RATE_LIMIT_MAX_DELAY / RATE_LIMIT_DELAY_INCREMENT),
        message: JSON.stringify(
            APIResponse
                .fromFailure("Too many requests, try again later.", HTTPStatus.TOO_MANY_REQUESTS, {}, "access")
                .getRaw(),
        ),
        windowMs: RATE_LIMIT_WINDOW,
    }));

    // Limite de requêtes, va ralentir chaque requête au delà de 100 sur 2 minutes,
    //  en ajoutant 100 ms de latence par requête supplémentaire, avec comme maximum 1 seconde de latence
    app.use(rateSlower({
        delayAfter: RATE_LIMIT_MAX_REQUESTS,
        delayMs: RATE_LIMIT_DELAY_INCREMENT,
        // @ts-ignore
        headers: true,
        maxDelayMs: RATE_LIMIT_MAX_DELAY,
        windowMs: RATE_LIMIT_WINDOW,
    }));
}

//======================================================================================================================
// Configuration des routes
//======================================================================================================================

app.use((req, _res, next) => {
    // HACK: Très peu orthodoxe de remplacer `req.query` et `req.body`
    void _res;

    if (Object.keys(req.query).length === 0 && Object.keys(req.body).length !== 0) {
        req.query = req.body;
    }

    if (Object.keys(req.body).length === 0 && Object.keys(req.query).length !== 0) {
        req.body = req.query;
    }

    next();
});

const routesPathRelative = "routes/api";
const routesPath = path.join(__dirname, routesPathRelative);

const importedRoutes: { path: string, route: string }[] = [];

walk.filesSync(routesPath, (basedir: string, rawFilename: string) => {
    let filename = rawFilename.replace(/\.[jt]s$/i, "");

    if (!/^(.+)\.(rest|shared|ws)/i.test(filename)) {
        console.warn("Extension de fichier interdite lors du chargement des routes:", rawFilename);
    }

    if (/^.+\.shared$/i.test(filename)) {
        return;
    }

    let endpoint = filename.replace(/^(.+)\.(rest|ws)?$/i, "$1");

    if (/^index$/i.test(endpoint)) {
        endpoint = "";
    }

    const route = "/api/" + path.relative(routesPath, path.join(basedir, endpoint)).replace(/\\/g, "/");

    importedRoutes.push({
        path: path.join(basedir, filename),
        route,
    });
}, (err) => {
    if (err) {
        console.error("File import error:", err);
    }
});

for (const importedRoute of importedRoutes) {
    app.use(importedRoute.route, require(importedRoute.path));
}

app.use("/", require("./routes/ws"));

// Redirige les 404 vers la gestion des erreurs
app.use((_req, _res, next) => {
    void _req;
    void _res;
    next(createError(HTTPStatus.NOT_FOUND));
});

// Gestion des erreurs
app.use((err, _req, res, _next) => {
    void _req;
    void _next;

    res.locals.message = err.message;
    res.locals.error = process.env.RELEASE_ENVIRONMENT === "dev" ? err : {};

    let response: APIResponse;

    if (err.message) {
        // Erreur express, comme un 404, ou erreur plus générale
        response = APIResponse.fromFailure(err.message, err.statusCode || HTTPStatus.INTERNAL_SERVER_ERROR, {}, "access");
    } else if (err.error) {
        // Erreur de validation JOI
        let error: { message: string, key: string } = {
            key: "?",
            message: "?",
        };

        for (const validationError of err.error.details) {
            console.debug("Validation error. type:", validationError.type, "key:", validationError.context.key);
            error = {
                key: validationError.context.key,
                message: validationError.message,
            };
        }

        response = APIResponse.fromFailure(error.message, HTTPStatus.BAD_REQUEST, {}, "validation");
    } else {
        console.error("Unknown Express error", err);
        response = APIResponse.fromFailure("?", HTTPStatus.INTERNAL_SERVER_ERROR, {}, "unknown");
    }

    response.send(res);
});

// @ts-ignore
app.options("*", cors(corsOptions));

app.listen(process.env.SERVER_PORT, () => {
    console.info(`Server is now listening on port ${process.env.SERVER_PORT}...`);
});
