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
            if (data.msg === "error") {
                console.debug("WebSocket client error:", data.reason);
                ws.send(JSON.stringify(data));
            } else if (data.msg === "changed" && data.collection === subscription) {
                let messages: Message[] = [];
                const fields: Record<string, unknown> = data.fields as Record<string, unknown>;
                const args: {ts: {"$date": Date} | Date}[] = fields.args as {ts: {"$date": Date}}[];
                // FIXME: Types
                for (let rawMessage of args) {
                    rawMessage.ts = rawMessage.ts["$date"];
                    messages.push(Message.fromFullMessage(rawMessage as RawMessage, data.currentUserId as string));
                }
                ws.send(JSON.stringify(messages));
            }
        });

    rcws.open();

    ws.on("message", (msg) => {
        rcws.send(msg.toString());
    });

    ws.on("close", () => {
        rcws.close();
    });
});
