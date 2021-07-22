/**
 * Liste les modules via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {listModules} from "./list.shared";

module.exports = APIRequest.ws(null, async (ws, req, auth, rcws) => {
    rcws.addClientCall(
        WebSocketClientEvent.LIST_MODULES,
        null,
        async (socket, _data, transmit) => {
            await listModules(auth as Authentication, (modules) => {
                transmit({
                    modules,
                }, WebSocketServerEvent.MODULE_LIST);
            }, (r) => {
                transmit({
                    error: true,
                    status: r.status,
                }, WebSocketServerEvent.ERROR);
            });
        },
    );
});
