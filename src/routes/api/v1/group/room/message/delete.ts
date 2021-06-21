import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    messageId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.delete(schema, async (req, res) => {
    await RocketChatRequest.request("POST", "/chat.delete", req, res, {
        roomId: req.body.roomId,
        msgId: req.body.messageId,
        asUser: true,
    }, (_r, data) => {
        if (data.success === true) {
            return APIResponse.fromSuccess();
        } else {
            return APIResponse.fromFailure();
        }
    }, (_r, _data) => {
        return APIResponse.fromFailure();
    });
});
