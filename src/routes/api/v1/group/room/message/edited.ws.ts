/**
 * Message modifié
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

interface EditedMessage {
    editor: {
        timestamp: Date,
        user: {
            id: string,
            username: string,
        },
    }
    message: Message,
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
            let messages: EditedMessage[] = [];
            for (let elt of elts) {
                const rawMessage = elt as WebSocketData;
                rawMessage.ts = rawMessage.ts["$date"];
                if (rawMessage.hasOwnProperty("editedAt") && rawMessage.hasOwnProperty("editedBy")) {
                    // Évite de compter les nouveaux messages comme des messages modifiés
                    messages.push({
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
            }
            ws.send(JSON.stringify(messages));
        });

    rcws.open(ws);
});
