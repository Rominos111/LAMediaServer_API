/**
 * Envoie un message
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
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    // FIXME: Set la limite en variable d'environnement ?
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "any.required": Language.get("validation.message.required"),
        "string.empty": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.min": Language.get("validation.message.short"),
        "string.trim": Language.get("validation.message.short"),
    }),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/chat.sendMessage", auth, res, {
        message: {
            msg: req.body.message.trim(),
            rid: req.body.channelId,
        },
    }, (r, data) => {
        return APIResponse.fromSuccess(Message.fromFullMessage(data.message as RawFullMessage, r.currentUserId as string));
    });
});
