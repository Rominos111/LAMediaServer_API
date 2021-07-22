/**
 * Liste les modules via WebSocket
 */

import {Authentication} from "helper/authentication";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        /*

        rocketChatSocket
    .addSubscription("stream-notify-user", [
        `${auth?.userId}/rooms-changed`,
        false,
    ], (transmit, content, currentUserId, data) => {
        console.log(content);
    })

         */
    },
};
