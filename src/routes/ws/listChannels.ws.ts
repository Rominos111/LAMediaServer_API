/**
 * Liste les modules via WebSocket
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
} from "helper/rocketChatWebSocket";
import {
    listChannels,
    schema_listChannels,
} from "routes/shared/channelList";

module.exports = {
    schema: schema_listChannels,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addClientCall(
            WebSocketClientEvent.LIST_CHANNELS,
            (transmit) => {
                listChannels(args.moduleRoomId, auth as Authentication, (channels) => {
                    transmit({
                        channels,
                    }, WebSocketClientEvent.LIST_CHANNELS);
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
