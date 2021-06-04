import express from "express";
import http from "http";
import dotenv from "dotenv";
import logger from "morgan";
import cors from "cors";
import APIResponse from "helper/APIResponse";

const csrf = require("csurf");
const RateLimit = require("express-rate-limit");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
const server = http.createServer(app);

//======================================================================================================================
// Configuration des middlewares
//======================================================================================================================

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

// Protection CSRF
if (process.env.RELEASE_ENVIRONMENT !== "dev") {
    app.use(csrf({}));
}

//======================================================================================================================
// Configuration des routes
//======================================================================================================================

const indexRouter = require("./routes");
const usersRouter = require("./routes/users");

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Redirige les 404 vers la gestion des erreurs
app.use((req, res, next) => {
    next(createError(404));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.RELEASE_ENVIRONMENT === "dev" ? err : {};

    let statusCode;
    let errors: Object[] = [{
        "type": "",
        "message": "(unknown)",
    }];

    if (err.message) {
        // Erreur express, comme un 404
        errors = [{
            "type": "access",
            "message": err.message
        }];

        statusCode = err.status || 500;
    } else if (err.error) {
        // Erreur de validation JOI
        errors = [];
        for (const error of err.error.details) {
            errors.push({
                "type": "validation",
                "message": error.message,
                "key": error.context.key
            });
        }

        statusCode = 400;
    }

    APIResponse.fromObject({"errors": errors}).send(res, statusCode);
});

// @ts-ignore
app.options("*", cors(corsOptions));

server.listen(process.env.SERVER_PORT, () => {
    console.info(`Server is now listening on port ${process.env.SERVER_PORT}...`);
});
