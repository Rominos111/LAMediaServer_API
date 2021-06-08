import express from "express";
import APIResponse from "helper/APIResponse"
import Validation from "helper/validation";
import Language from "helper/language";
import JWT from "helper/JWT";
import {RequestMethod, RocketChatRequest} from "helper/request";

let router = express.Router();

const schema = Validation.object({
    username: Validation.string().alphanum().min(3).max(32).required().messages({
        "string.empty": Language.get("validation.username.empty"),
        "string.min": Language.get("validation.username.short"),
        "string.max": Language.get("validation.username.long"),
        "any.required": Language.get("validation.username.required")
    }),
    password: Validation.string().required().messages({
        "string.empty": Language.get("validation.password.empty"),
        "any.required": Language.get("validation.password.required")
    }),
});

router.post("/", Validation.post(schema), (req, res) => {
    RocketChatRequest.request(RequestMethod.POST, "/login", null, res, {
        username: req.body.username,
        password: req.body.password
    }, (r, data) => {
        const token = JWT.createToken(data.userId, data.authToken, data.me.username);
        return APIResponse.fromSuccess({
            token: token
        });
    });
});

module.exports = router;
