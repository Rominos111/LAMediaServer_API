import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {
    RequestMethod,
    RocketChatRequest,
} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    groupRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "any.required": Language.get("validation.message.required"),
        "string.empty": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.min": Language.get("validation.message.short"),
        "string.trim": Language.get("validation.message.short"),
    }),
    messageId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.put(schema, async (req, res) => {
    await RocketChatRequest.request(RequestMethod.POST, "/chat.update", req, res, {
        msgId: req.body.messageId,
        roomId: req.body.groupRoomId,
        text: req.body.message,
    }, (r, data) => {
        console.log(r);
        return null;
    });
});
