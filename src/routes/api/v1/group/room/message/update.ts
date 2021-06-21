import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    RequestMethod,
    RocketChatRequest,
} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";
import {Room} from "model/room";

const schema = Validation.object({
    groupRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    messageId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "any.required": Language.get("validation.message.required"),
        "string.empty": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.min": Language.get("validation.message.short"),
        "string.trim": Language.get("validation.message.short"),
    }),
});

module.exports = APIRequest.put(schema, (req, res) => {
    RocketChatRequest.request(RequestMethod.POST, "/chat.update", req, res, {
        roomId: req.body.groupRoomId,
        msgId: req.body.messageId,
        text: req.body.message,
    }, (r, data) => {
        console.log(r);
        return null;
    }).then();
});
