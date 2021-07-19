/**
 * Liste les modules via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {listModules} from "./list.shared";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .onClientCall(null, async (_data, transmit) => {
            await listModules(auth as Authentication, (modules) => {
                transmit({
                    modules,
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
