/**
 * Module modifié
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocketMessage,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {RawChannel} from "model/channel";

const schema = Validation.object({
    moduleRoomId: Validation.id().required(),
});

module.exports = APIRequest.ws(schema, async (ws, req, auth, rcws) => {
    rcws.addSubscription(
        "stream-notify-user",
        [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ],
        (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.UPDATED) {
                const room = content as RawChannel;
                if (room._id === req.query.moduleRoomId) {
                    transmit({
                        id: room.teamId,
                        roomId: room._id,
                    }, WebSocketServerEvent.MODULE_UPDATED);
                }
            }
        },
    );
});
