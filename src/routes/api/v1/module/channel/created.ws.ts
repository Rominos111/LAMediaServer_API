/**
 * Module créé
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

interface WebSocketData extends RawChannel {
    teamId?: string,
}

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
            if (message.fields.args[0] === RocketChatWebSocketMessage.INSERTED) {
                const createdChannel = content as WebSocketData;
                if (createdChannel.teamId) {
                    // Cette WebSocket est aussi appelée lors de la création de modules
                    return;
                }

                const channel = Channel.fromFullObject(createdChannel, auth?.userId as string);
                if (channel.parentModuleId === req.query.moduleRoomId) {
                    transmit(channel);
                }
            }
        });

    await rcws.open(ws, req);
});
