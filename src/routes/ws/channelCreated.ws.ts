/**
 * Module créé
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
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

const createdChannels: string[] = [];

module.exports = {
    schema,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-notify-user",
            [
                `${auth.userId}/subscriptions-changed`,
                false,
            ],
            (transmit, content, currentUserId, data) => {
                if (data.fields.args[0] === RocketChatWebSocketMessage.INSERTED) {
                    const rawChannel = content as RawChannel;
                    if (rawChannel.teamId || rawChannel.msgs === void null || rawChannel.usersCount === void null) {
                        // Cette WebSocket est aussi appelée lors de la création de modules
                        return;
                    }

                    const channel = Channel.fromFullObject(rawChannel, auth?.userId as string);
                    const key = `${auth.userId}-${channel.id}`;
                    if (channel.parentModuleId === args.moduleRoomId && !createdChannels.includes(key)) {
                        createdChannels.push(key);
                        transmit(channel, WebSocketServerEvent.CHANNEL_CREATED);
                    }
                }
            },
        );
    },
};
