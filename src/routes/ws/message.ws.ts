/**
 * Envoi et réception d'un message
 */

import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {
    TransmitData,
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema_connect = Validation.object({
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

module.exports = APIRequest.ws(schema_connect, async (ws, req, auth, rcws) => {
    rcws.addSubscription(
        "stream-room-messages",
        [
            req.query.channelId as string,
            false,
        ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown, currentUserId: string | null) => {
            const rawMessage = content as WebSocketData;
            if (rawMessage.hasOwnProperty("editedAt") && rawMessage.hasOwnProperty("editedBy")) {
                // Évite de compter les nouveaux messages comme des messages modifiés
                rawMessage.ts = rawMessage.ts["$date"];
                transmit({
                    editor: {
                        timestamp: new Date(rawMessage.editedAt?.$date as Date),
                        user: {
                            id: rawMessage.editedBy?._id as string,
                            username: rawMessage.editedBy?.username as string,
                        },
                    },
                    message: Message.fromFullMessage(rawMessage, currentUserId as string),
                }, WebSocketServerEvent.MESSAGE_EDITED);
            } else {
                // Évite de compter les messages modifiés comme de nouveaux messages
                rawMessage.ts = rawMessage.ts["$date"];
                transmit(Message.fromFullMessage(rawMessage, currentUserId as string), WebSocketServerEvent.MESSAGE_CREATED);
            }
        },
    );

    rcws.addSubscription(
        "stream-notify-room",
        [
            `${req.query.channelId}/deleteMessage`,
            false,
        ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown) => {
            const message = content as { _id: string };
            transmit({
                id: message._id,
            }, WebSocketServerEvent.MESSAGE_DELETED);
        },
    );

    rcws.addClientCall(
        WebSocketClientEvent.SEND_MESSAGE,
        schema_sendMessage,
        (socket, data) => {
            socket.callMethod("sendMessage", {
                msg: (data.message as string).trim(),
                rid: data.channelId ? data.channelId : req.query.channelId,
            });
        },
    );
});
