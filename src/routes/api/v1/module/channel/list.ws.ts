/**
 * Liste les modules via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    listUsers,
    schema_listUsers,
} from "routes/api/v1/module/channel/user/list.shared";
import {
    listChannels,
    schema_listModules,
} from "./list.shared";

/*
module.exports = APIRequest.ws(null, true, async (ws, req, auth, rocketChatSocket) => {
    console.log("Utilisé");

    rocketChatSocket
        .addSubscription("stream-notify-user", [
            `${auth?.userId}/rooms-changed`,
            false,
        ], (transmit, content, currentUserId, data) => {
            console.log(content);
        })
});
*/
module.exports = APIRequest.wip();
