import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.ws(schema, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo("stream-notify-room", [
            `${req.query.roomId}/deleteMessage`,
            false,
        ])
        .onResponse((elts: unknown[]) => {
            const ids: { id: string }[] = [];
            for (const elt of elts) {
                const eltTyped = elt as { _id: string };
                ids.push({
                    id: eltTyped._id,
                });
            }
            ws.send(JSON.stringify(ids));
        });

    rcws.open(ws);
});
