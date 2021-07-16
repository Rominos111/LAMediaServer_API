/**
 * Module supprimé
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocket,
    RocketChatWebSocketMessage,
    TransmitData,
} from "helper/rocketChatWebSocket";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-user", [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.REMOVED) {
                transmit({
                    moduleRoomId: (content as { _id: string })._id,
                });
            }
        });

    await rcws.open(ws, req);
});
