import express from "express";
import APIResponse from "helper/APIResponse"

let router = express.Router();

router.get("/", (req, res, next) => {
    APIResponse.fromArray([1, 2, 3]).send(res);
});

module.exports = router;
