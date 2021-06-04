import express from "express";
import APIResponse from "helper/APIResponse"
import Validation from "helper/validation";
const validator = require("express-joi-validation").createValidator({
    passError: true
});

let router = express.Router();

router.get("/", validator.query(Validation.formLoginSchema), (req, res) => {
    APIResponse.fromString("index").send(res);
});

router.post("/login", validator.body(Validation.formLoginSchema), (req, res) => {
    APIResponse.fromObject(req.body).send(res);
});

module.exports = router;
