/**
 * Liste les modules via WebSocket
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {listModules} from "routes/shared/moduleList";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
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
    },
};
