/**
 * Liste les modules via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    listChannels,
    schema_listModules,
} from "./list.shared";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .onClientCall(schema_listModules, async (data, transmit) => {
            await listChannels(data.moduleRoomId as string, auth as Authentication, (channels) => {
                transmit({
                    channels,
                });
            }, (r) => {
                transmit({
                    error: true,
                    status: r.status,
                });
            });
        });

    await rcws.open(ws, req);
});
