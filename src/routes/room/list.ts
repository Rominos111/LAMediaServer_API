import express from "express";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import {RequestMethod, RocketChatRequest} from "helper/request";
import Validation from "helper/validation";
import Channel from "model/channel";

let router = express.Router();

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
});

router.get("/", Validation.get(schema), (req, res) => {
    RocketChatRequest.request(RequestMethod.GET, "/rooms.get", req.body.token, res, null, (r, data) => {
        let rooms: Channel[] = [];

        for (const elt of data.update) {
            rooms.push(new Channel(elt._id, elt.name, elt.description, elt.default));
        }

        return APIResponse.fromSuccess(rooms);
    });
});

module.exports = router;

// TODO: lastMessage ?
