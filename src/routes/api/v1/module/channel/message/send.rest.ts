/**
 * Envoie un message
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    Message,
    RawFullMessage,
} from "model/message";
import {schema_sendMessage} from "./send.shared";

module.exports = APIRequest.post(schema_sendMessage, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/chat.sendMessage", auth, res, {
        message: {
            msg: req.body.message.trim(),
            rid: req.body.channelId,
        },
    }, (r, data) => {
        return APIResponse.fromSuccess(Message.fromFullMessage(data.message as RawFullMessage, r.currentUserId as string));
    });
});
