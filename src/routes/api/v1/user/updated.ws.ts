import {APIRequest} from "helper/APIRequest";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";

module.exports = APIRequest.ws(null, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo("stream-notify-logged", [
            "Users:NameChanged",
            false,
        ])
        .onResponse((data) => {
            // TODO: Ne fonctionne pas ?
            console.log("user updated", data);
        });

    rcws.open(ws);
});
