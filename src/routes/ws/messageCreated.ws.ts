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
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema = Validation.object({
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

interface WebSocketData extends RawFullMessage {
    $date: number | Date,
    editedAt?: {
        $date: number | Date,
    },
    editedBy?: {
        _id: string,
        username: string,
    }
}

module.exports = {
    schema,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-room-messages",
            [
                args.channelId as string,
                false,
            ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown, currentUserId: string | null) => {
                const rawMessage = content as WebSocketData;
                if (rawMessage.hasOwnProperty("editedAt") && rawMessage.hasOwnProperty("editedBy")) {
                    // Évite de compter les nouveaux messages comme des messages modifiés
                } else {
                    // Évite de compter les messages modifiés comme de nouveaux messages
                    rawMessage.ts = rawMessage.ts["$date"];
                    transmit(Message.fromFullMessage(rawMessage, currentUserId as string), WebSocketServerEvent.MESSAGE_CREATED);
                }
            },
        );
    },
};
