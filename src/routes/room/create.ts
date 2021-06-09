import express from "express";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";
import Channel from "model/channel";

let router = express.Router();

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
    name: Validation.string().required().messages({
        "any.required": Language.get("validation.name.required"),
    }),
    members: Validation.array().items(Validation.string().required()),
});

router.post("/", Validation.get(schema), (req, res) => {
    RocketChatRequest.request("POST", "/channels.create", req.body.token, res, {
        name: req.body.name,
        members: [req.body.members] // FIXME: Nécessaire ?
    }, (r, data) => {
        return APIResponse.fromSuccess(new Channel(data.channel._id, data.channel.name));
    });
});

module.exports = router;
