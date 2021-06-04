import express from "express";
import APIResponse from "helper/APIResponse"
import Validation from "helper/validation";
const validator = require("express-joi-validation").createValidator({
    passError: true
});

let router = express.Router();

router.get("/", (req, res) => {
    APIResponse.fromString("OK").send(res);
});

// FIXME: Transformer en POST
router.get("/login", validator.query(Validation.formLoginSchema), (req, res) => {
    APIResponse.fromObject("OK").send(res);
});

module.exports = router;
