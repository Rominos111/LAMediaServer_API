/**
 * Liste les utilisateurs d'un groupe via WebSocket
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
} from "helper/rocketChatWebSocket";
import {
    listUsers,
    schema_listUsers,
} from "routes/shared/userList";

module.exports = {
    schema: schema_listUsers,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        /*
        rcws.addSubscription(
            "stream-notify-user",
            [
                `${auth?.userId}/rooms-changed`,
                false,
            ], (transmit, content, currentUserId, data) => {
                // console.log(data);
            },
        );
        */

        rcws.addClientCall(
            WebSocketClientEvent.LIST_USERS,
            (transmit) => {
                listUsers(args.channelId as string, auth as Authentication, (users) => {
                    transmit({
                        users,
                    }, WebSocketClientEvent.LIST_USERS);
                }, (r) => {
                    transmit({
                        error: true,
                        status: r.status,
                    }, WebSocketClientEvent.ERROR);
                }).then();

                return null;
            },
        );
    },
};
