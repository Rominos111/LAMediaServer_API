/**
 * Liste les modules via WebSocket
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
} from "helper/rocketChatWebSocket";
import {listModules} from "routes/shared/moduleList";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addClientCall(
            WebSocketClientEvent.LIST_MODULES,
            (transmit) => {
                listModules(auth as Authentication, (modules) => {
                    transmit({
                        modules,
                    }, WebSocketClientEvent.LIST_MODULES);
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
