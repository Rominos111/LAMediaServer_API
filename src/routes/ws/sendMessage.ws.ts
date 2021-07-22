/**
 * Envoi et réception d'un message
 */

import {Authentication} from "helper/authentication";
import {Language} from "helper/language";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

const schema_sendMessage = Validation.object({
    channelId: Validation.id(),
    message: Validation.string().trim().min(1).max(2_000).required().messages({
        "any.required": Language.get("validation.message.required"),
        "string.empty": Language.get("validation.message.short"),
        "string.max": Language.get("validation.message.long"),
        "string.min": Language.get("validation.message.short"),
        "string.trim": Language.get("validation.message.short"),
    }),
});

module.exports = {
    schema,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addClientCall(
            WebSocketClientEvent.SEND_MESSAGE,
            schema_sendMessage,
            (socket, data) => {
                socket.callMethod("sendMessage", {
                    msg: (data.message as string).trim(),
                    rid: data.channelId ? data.channelId : args.channelId,
                });
            },
        );
    },
};
