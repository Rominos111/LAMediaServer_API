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
    channelId: Validation.id().required(),
    moduleRoomId: Validation.id().required(),
});

interface WebSocketData extends RawChannel {
    teamId: string,
}

module.exports = APIRequest.ws(schema, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-user", [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.UPDATED) {
                const updatedChannel = Channel.fromFullObject(content as WebSocketData, auth?.userId as string);
                if (updatedChannel.id === req.query.channelId) {
                    transmit(updatedChannel);
                }
            }
        });

    await rcws.open(ws, req);
});
