/**
 * Modifie un message
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema = Validation.object({
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
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.put(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/chat.update", auth, res, {
        msgId: req.body.messageId,
        roomId: req.body.roomId,
        text: req.body.message,
    }, (r, data) => {
        return APIResponse.fromSuccess(Message.fromFullMessage(data.message as RawFullMessage, auth?.userId as string));
    }, (r, data) => {
        if (r.status === 400) {
            if (r.statusText.toLowerCase().includes("no message found")) {
                return APIResponse.fromFailure(Language.get("validation.not-found"), 404);
            } else if (r.statusText.toLowerCase().includes("room id provided does not match")) {
                return APIResponse.fromFailure(Language.get("validation.no-match-room"), 404);
            }
        }

        return APIResponse.fromFailure(r.statusText, data.error as string);
    });
});
