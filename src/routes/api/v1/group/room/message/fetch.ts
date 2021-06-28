import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {Message} from "model/message";

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
                for (let rawMessage of data.fields.args) {
                    rawMessage.ts = rawMessage.ts["$date"];
                    messages.push(Message.fromFullMessage(rawMessage, data.currentUserId));
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
