import express from "express";
import Validation from "helper/validation";
import {RequestMethod, RocketChatRequest} from "helper/request";

let router = express.Router();

const schema = Validation.object({
    token: Validation.jwt().required(),
});

router.post("/", Validation.post(schema), (req, res) => {
    RocketChatRequest.request(RequestMethod.POST, "/logout", req.body.token, res);
});

module.exports = router;
