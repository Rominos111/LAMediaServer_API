import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    _token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.ws(schema, true, async (ws, req) => {
    const subscription = "stream-notify-room";

    const rcws = RocketChatWebSocket
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo(subscription, [
            `${req.query.roomId}/deleteMessage`,
            false,
        ])
        .onResponse((data) => {
            const fields: Record<string, unknown> = data.fields as Record<string, unknown>;
            const args: { _id: string } = fields.args as { _id: string };
            ws.send(JSON.stringify({
                id: args._id,
            }));
        });

    rcws.open();

    ws.on("message", (msg) => {
        rcws.send(msg.toString());
    });

    ws.on("close", () => {
        rcws.close();
    });
});
