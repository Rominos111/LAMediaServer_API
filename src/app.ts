import express from "express";
import http from "http";
import dotenv from "dotenv";
import logger from "morgan";
import cors from "cors";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RateLimit from "express-rate-limit";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import walk from "fs-walk";
import {randomBytes} from "crypto";

const app = express();
const server = http.createServer(app);

//======================================================================================================================
// Configuration des middlewares
//======================================================================================================================

if (process.env.SESSION_SECRET === undefined || process.env.SESSION_SECRET === "") {
    process.env.SESSION_SECRET = randomBytes(256).toString("hex");
}

if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === "") {
    process.env.JWT_SECRET = randomBytes(256).toString("hex");
}

if (process.env.AES_KEY === undefined || process.env.AES_KEY === "") {
    process.env.AES_KEY = randomBytes(16).toString("hex");
}

if (process.env.AES_IV === undefined || process.env.AES_IV === "") {
    process.env.AES_IV = randomBytes(32).toString("hex");
}

Language.config("fr-FR");

dotenv.config();

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
    origin: `http://${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`, // FIXME: Utiliser HTTPS en production
    preflightContinue: false,
};

// CORS
app.use(cors(corsOptions));

// Logs
app.use(logger("dev"));

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookies
app.use(cookieParser());

// Rate limit, 1000 requêtes sur une fenêtre de 5 minutes
app.use(new RateLimit({
    windowMs: 5 * 60 * 1000,
    max: 1000
}));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

//======================================================================================================================
// Configuration des routes
//======================================================================================================================

const routesPathRelative = "routes";
const routesPath = path.join(__dirname, routesPathRelative);

let importedRoutes: {route: string, path: string}[] = [];

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
        // Erreur express, comme un 404
        response = APIResponse.fromFailure(err.message, err.statusCode || 500, null, "access");
    } else if (err.error) {
        // Erreur de validation JOI
        let error: {message: string, key: string} = {
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
