import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocket,
    TransmitData,
} from "helper/rocketChatWebSocket";

module.exports = APIRequest.ws(null, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-logged", [
            "Users:NameChanged",
            false,
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown) => {
            // TODO: Ne fonctionne pas ?
            console.log("user updated", content);
        });

    await rcws.open(ws, req);
});
