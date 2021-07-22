/**
 * Module créé
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocketMessage,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Channel,
    RawChannel,
} from "model/channel";

const schema = Validation.object({
    moduleRoomId: Validation.id().required(),
});

module.exports = APIRequest.ws(schema, async (ws, req, auth, rocketChatSocket) => {
    rocketChatSocket.addSubscription(
        "stream-notify-user",
        [
            `${auth?.userId}/subscriptions-changed`,
            false,
        ],
        (transmit, content, currentUserId, data) => {
            if (data.fields.args[0] === RocketChatWebSocketMessage.INSERTED) {
                const createdChannel = content as RawChannel;
                if (createdChannel.teamId) {
                    // Cette WebSocket est aussi appelée lors de la création de modules
                    return;
                }

                const channel = Channel.fromFullObject(createdChannel, auth?.userId as string);
                if (channel.parentModuleId === req.query.moduleRoomId) {
                    transmit(channel, WebSocketServerEvent.CHANNEL_CREATED);
                }
            }
        },
    );
});
