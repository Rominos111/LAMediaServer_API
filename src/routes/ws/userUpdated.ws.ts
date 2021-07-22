import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription("stream-notify-logged",
            [
                "Users:NameChanged",
                false,
            ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown) => {
                // TODO: Ne fonctionne pas ?
                console.log("user updated", content);
            },
        );
    },
};
