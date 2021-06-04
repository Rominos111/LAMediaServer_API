import express from "express";
import APIResponse from "helper/APIResponse"

let router = express.Router();

router.get("/", (req, res, next) => {
    APIResponse.fromString("index").send(res);
});

module.exports = router;
