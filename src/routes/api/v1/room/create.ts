import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";
import {Channel} from "model/channel";

const schema = Validation.object({
    name: Validation.string().required().messages({
        "any.required": Language.get("validation.name.required"),
    }),
    members: Validation.array().items(Validation.string().required()),
});

module.exports = APIRequest.post(schema, (req, res) => {
    RocketChatRequest.request("POST", "/channels.create", req, res, {
        name: req.body.name,
        members: [req.body.members] // FIXME: Nécessaire ?
    }, (_r, data) => {
        return APIResponse.fromSuccess(new Channel(data.channel._id, data.channel.name));
    });
});
