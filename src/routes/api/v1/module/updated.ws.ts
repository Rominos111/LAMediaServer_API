/**
 * Module modifié
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocket,
    RocketChatWebSocketMessage,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Channel,
    RawChannel,
} from "model/channel";

const schema = Validation.object({
    moduleRoomId: Validation.id().required(),
});

module.exports = APIRequest.ws(schema, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-user", [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.UPDATED) {
                const room = content as RawChannel;
                if (room._id === req.query.moduleRoomId) {
                    transmit({
                        id: room.teamId,
                        roomId: room._id,
                    });
                }
            }
        });

    await rcws.open(ws, req);
});
