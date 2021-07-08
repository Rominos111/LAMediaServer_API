/**
 * Message envoyé
 */

import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
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
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo("stream-room-messages", [
            req.query.roomId as string,
            false,
        ])
        .onResponse((elts: unknown[], currentUserId) => {
            let messages: Message[] = [];
            for (let elt of elts) {
                const rawMessage = elt as WebSocketData;
                rawMessage.ts = rawMessage.ts["$date"];
                if (!rawMessage.hasOwnProperty("editedAt") && !rawMessage.hasOwnProperty("editedBy")) {
                    // Évite de compter les messages modifiés comme de nouveaux messages
                    messages.push(Message.fromFullMessage(rawMessage, currentUserId as string));
                }
            }
            ws.send(JSON.stringify(messages));
        });

    rcws.open(ws);
});
