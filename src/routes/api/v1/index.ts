import express from "express";
import {APIResponse} from "helper/APIResponse"

let router = express.Router();

router.get("/", (req, res) => {
    APIResponse.fromString("OK").send(res);
});

module.exports = router;
