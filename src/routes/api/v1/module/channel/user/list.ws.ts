/**
 * Liste les utilisateurs d'un groupe via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {
    listUsers,
    schema_listUsers,
} from "./list.shared";

module.exports = APIRequest.ws(null, async (ws, req, auth, rocketChatSocket) => {
    rocketChatSocket.addSubscription(
        "stream-notify-user",
        [
            `${auth?.userId}/rooms-changed`,
            false,
        ], (transmit, content, currentUserId, data) => {
            // console.log(data);
        },
    );

    rocketChatSocket.addClientCall(
        WebSocketClientEvent.LIST_CHANNELS,
        schema_listUsers,
        async (socket, data, transmit) => {
            await listUsers(data.channelId as string, auth as Authentication, (users) => {
                transmit({
                    users,
                }, WebSocketServerEvent.CHANNEL_USER_LIST);
            }, (r) => {
                transmit({
                    error: true,
                    status: r.status,
                }, WebSocketServerEvent.ERROR);
            });
        },
    );
});

module.exports = APIRequest.wip();
