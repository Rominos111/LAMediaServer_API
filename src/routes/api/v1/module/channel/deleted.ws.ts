/**
 * Module supprimé
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocketMessage,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";

module.exports = APIRequest.ws(null, async (ws, req, auth, rcws) => {
    rcws.addSubscription(
        "stream-notify-user",
        [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.REMOVED) {
                transmit({
                    channelId: (content as { _id: string })._id,
                }, WebSocketServerEvent.CHANNEL_DELETED);
            }
        },
    );
});

module.exports = APIRequest.wip();
