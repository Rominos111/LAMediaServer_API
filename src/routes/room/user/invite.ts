import express from "express";
import APIRequest from "helper/APIRequest";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";

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

module.exports = APIRequest.post(schema, (req, res) => {
    RocketChatRequest.request("POST", "/channels.invite", req.body.token, res, {
        roomId: req.body.roomId,
    });
});
