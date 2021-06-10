import APIRequest from "helper/APIRequest";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RocketChatRequest from "helper/RocketChatRequest";
import Validation from "helper/validation";
import Message from "model/message";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "string.min": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.trim": Language.get("validation.message.short"),
        "string.empty": Language.get("validation.message.short"),
        "any.required": Language.get("validation.message.required"),
    }),
});

module.exports = APIRequest.post(schema, (req, res) => {
    RocketChatRequest.request("POST", "/chat.sendMessage", req, res, {
        message: {
            rid: req.body.roomId,
            msg: req.body.message.trim(),
        },
    }, (r, data) => {
        return APIResponse.fromSuccess(Message.fromFullMessage(data.message));
    });
});
