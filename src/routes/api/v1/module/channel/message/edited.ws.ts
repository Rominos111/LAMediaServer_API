/**
 * Message modifié
 */

import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {
    RocketChatWebSocket,
    TransmitData,
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

module.exports = APIRequest.ws(schema, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-room-messages", [
            req.query.channelId as string,
            false,
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null) => {
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
                });
            }
        });

    await rcws.open(ws, req);
});
