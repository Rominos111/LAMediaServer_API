/**
 * Liste les utilisateurs d'un groupe via WebSocket
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {
    listUsers,
    schema_listUsers,
} from "routes/shared/userList";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-notify-user",
            [
                `${auth?.userId}/rooms-changed`,
                false,
            ], (transmit, content, currentUserId, data) => {
                // console.log(data);
            },
        );

        rcws.addClientCall(
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

    },
};
