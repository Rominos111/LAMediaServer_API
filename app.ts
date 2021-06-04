import express from "express";
import http from "http";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import socketio from "socket.io";
import logger from "morgan";

let createError = require("http-errors");
let cookieParser = require("cookie-parser");

let indexRouter = require("./routes");
let usersRouter = require("./routes/users");

let app = express();

let router = express.Router();

let server = http.createServer(app);

dotenv.config();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Redirige les 404 vers la gestion des erreurs
app.use((req, res, next) => {
    next(createError(404));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    // Dev
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // FIXME: Utiliser .env ?

    res.status(err.status || 500).json({"a": "b"});
});

server.listen(process.env.SERVER_PORT, () => {
    console.info(`Server is now listening on port ${process.env.SERVER_PORT}...`);
});
