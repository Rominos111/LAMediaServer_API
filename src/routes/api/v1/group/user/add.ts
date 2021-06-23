import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    invitedUserId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.post(schema, async (req, res) => {
    await RocketChatRequest.request("POST", "/channels.invite", req, res, {
        roomId: req.body.roomId,
    });
});
