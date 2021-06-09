import express from "express";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";

let router = express.Router();

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    invitedUserId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

router.post("/", Validation.get(schema), (req, res) => {
    RocketChatRequest.request("POST", "/channels.invite", req.body.token, res, {
        roomId: req.body.roomId,
    });
});

module.exports = router;
