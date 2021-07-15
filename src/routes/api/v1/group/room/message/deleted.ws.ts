/**
 * Message supprimé
 */

import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {
    RocketChatWebSocket,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.ws(schema, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-room", [
            `${req.query.roomId}/deleteMessage`,
            false,
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown) => {
            const eltTyped = content as { _id: string };
            transmit({
                id: eltTyped._id,
            });
        });

    await rcws.open(ws, req);
});
