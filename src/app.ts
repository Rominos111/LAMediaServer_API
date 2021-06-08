import cors from "cors";
import {randomBytes} from "crypto";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-slow-down";
import walk from "fs-walk";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import http from "http";
import createError from "http-errors";
import logger from "morgan";
import path from "path";

const app = express();
const server = http.createServer(app);

//======================================================================================================================
// Configuration des middlewares
//======================================================================================================================

dotenv.config();

if (process.env.SESSION_SECRET === undefined || process.env.SESSION_SECRET === "") {
    process.env.SESSION_SECRET = randomBytes(64).toString("hex");
    if (process.env.RELEASE_ENVIRONMENT === "prod") {
        console.info("Session secret:", process.env.SESSION_SECRET);
    }
}

if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === "") {
    process.env.JWT_SECRET = randomBytes(64).toString("hex");
    if (process.env.RELEASE_ENVIRONMENT === "prod") {
        console.info("JWT secret:", process.env.JWT_SECRET);
    }
}

if (process.env.AES_KEY === undefined || process.env.AES_KEY === "") {
    process.env.AES_KEY = randomBytes(16).toString("hex");
    if (process.env.RELEASE_ENVIRONMENT === "prod") {
        console.info("AES key:", process.env.AES_KEY);
    }
}

if (process.env.AES_IV === undefined || process.env.AES_IV === "") {
    process.env.AES_IV = randomBytes(8).toString("hex");
    if (process.env.RELEASE_ENVIRONMENT === "prod") {
        console.info("AES IV:", process.env.AES_IV);
    }
}

Language.config("fr-FR");

const corsOptions: cors.CorsOptions = {
    allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
    ],
    credentials: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    origin: `${process.env.SERVER_PROTOCOL}://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`, // FIXME: Utiliser HTTPS en production
    preflightContinue: false,
};

if (process.env.REVERSE_PROXY !== undefined && ["1", "true"].includes(process.env.REVERSE_PROXY.toLowerCase())) {
    app.enable("trust proxy");
}

// CORS
app.use(cors(corsOptions));

// Logs
if (process.env.RELEASE_ENVIRONMENT === "dev") {
    app.use(logger("dev"));
} else {
    app.use(logger("short"));
}

// JSON
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Limite de requêtes, va ralentir chaque requête au delà de 100 sur 2 minutes,
//  en ajoutant 100 ms de latence par requête supplémentaire, avec comme maximum 5 secondes de latence
app.use(rateLimit({
    windowMs: 2 * 60 * 1000,
    delayAfter: 100,
    delayMs: 100,
    maxDelayMs: 5 * 1000
}));

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

        for (const JOIError of err.error.details) {
            error = {
                "message": JOIError.message,
                "key": JOIError.context.key  // TODO: Gérer le champ erroné ?
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
