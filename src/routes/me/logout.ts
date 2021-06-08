import express from "express";
import Language from "helper/language";
import {RequestMethod, RocketChatRequest} from "helper/request";
import Validation from "helper/validation";

let router = express.Router();

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required")
    }),
});

router.post("/", Validation.post(schema), (req, res) => {
    RocketChatRequest.request(RequestMethod.POST, "/logout", req.body.token, res);
});

module.exports = router;
