import {APIRequest} from "helper/APIRequest";
import {
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";

module.exports = APIRequest.ws(null, async (ws, req, auth, rcws) => {
    rcws.addSubscription("stream-notify-logged",
        [
            "Users:NameChanged",
            false,
        ], (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown) => {
            // TODO: Ne fonctionne pas ?
            console.log("user updated", content);
        },
    );
});
