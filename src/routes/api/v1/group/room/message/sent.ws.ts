import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Message,
    RawMessage,
} from "model/message";

const schema = Validation.object({
    _token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

interface WebSocketData extends RawMessage {
    $date: number | Date,
    editedAt: undefined | {
        $date: number | Date,
    },
    editedBy: undefined | {
        _id: string,
        username: string,
    }
}

module.exports = APIRequest.ws(schema, true, async (ws, req) => {
    const subscription = "stream-room-messages";

    const rcws = RocketChatWebSocket
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo(subscription, [
            req.query.roomId as string,
            false,
        ])
        .onResponse((data) => {
            let messages: Message[] = [];
            const fields: Record<string, unknown> = data.fields as Record<string, unknown>;
            const args: WebSocketData[] = fields.args as WebSocketData[];
            for (let rawMessage of args) {
                rawMessage.ts = rawMessage.ts["$date"];
                if (rawMessage.editedAt === undefined && rawMessage.editedBy === undefined) {
                    // Évite de compter les messages modifiés comme de nouveaux messages
                    messages.push(Message.fromFullMessage(rawMessage, data.currentUserId as string));
                }
            }
            ws.send(JSON.stringify(messages));
        });

    rcws.open();

    ws.on("message", (msg) => {
        rcws.send(msg.toString());
    });

    ws.on("close", () => {
        rcws.close();
    });
});
