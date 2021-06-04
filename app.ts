import express from "express";
import http from "http";
import dotenv from "dotenv";
import logger from "morgan";
import cors from "cors";
import APIResponse from "helper/APIResponse";

const createError = require("http-errors");
let cookieParser = require("cookie-parser");

let app = express();
let server = http.createServer(app);

dotenv.config();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users/index");

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

    APIResponse.fromObject({"error": err.message}).send(res, err.status || 500);
});

server.listen(process.env.SERVER_PORT, () => {
    console.info(`Server is now listening on port ${process.env.SERVER_PORT}...`);
});
