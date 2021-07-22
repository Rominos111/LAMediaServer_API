/**
 * Module supprimé
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    RocketChatWebSocketMessage,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";

module.exports = {
    schema: null,
    callback: async (_args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-notify-user",
            [
                `${auth?.userId}/rooms-changed`,
                {"useCollection": false, "args": []},
            ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown, currentUserId: string | null, message) => {
                if (message.fields.args[0] === RocketChatWebSocketMessage.REMOVED) {
                    transmit({
                        moduleRoomId: (content as { _id: string })._id,
                    }, WebSocketServerEvent.MODULE_DELETED);
                }
            },
        );
    },
};
