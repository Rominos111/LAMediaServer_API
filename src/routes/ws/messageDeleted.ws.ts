/**
 * Envoi et réception d'un message
 */

import {Authentication} from "helper/authentication";
import {Language} from "helper/language";
import {
    RocketChatWebSocket,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = {
    schema,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-notify-room",
            [
                `${args.channelId}/deleteMessage`,
                false,
            ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown) => {
                const message = content as { _id: string };
                transmit({
                    id: message._id,
                }, WebSocketServerEvent.MESSAGE_DELETED);
            },
        );
    },
};
