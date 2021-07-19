/**
 * Modifie un message
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    HTTPStatus,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema = Validation.object({
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "any.required": Language.get("validation.message.required"),
        "string.empty": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.min": Language.get("validation.message.short"),
        "string.trim": Language.get("validation.message.short"),
    }),
    messageId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.put(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/chat.update", auth, res, {
        msgId: req.body.messageId,
        roomId: req.body.channelId,
        text: req.body.message,
    }, (r, data) => {
        return APIResponse.fromSuccess(Message.fromFullMessage(data.message as RawFullMessage, auth?.userId as string));
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST) {
            if (r.statusText.toLowerCase().includes("no message found")) {
                return APIResponse.fromFailure(Language.get("validation.message.not-found"), HTTPStatus.NOT_FOUND);
            } else if (r.statusText.toLowerCase().includes("room id provided does not match")) {
                return APIResponse.fromFailure(Language.get("validation.message.no-match-channel"), HTTPStatus.NOT_FOUND);
            }
        }

        return APIResponse.fromFailure(data.error, r.status);
    });
});
