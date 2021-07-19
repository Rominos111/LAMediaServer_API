import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    RawRole,
    Role,
} from "model/role";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-logged", [
            "user-status",
            false,
        ])
        .onClientCall(null, async (_data, transmit) => {
            void _data;
            await RocketChatRequest.request(RequestMethod.GET, "/roles.list", auth, null, null, (_r, data) => {
                void _r;
                transmit({
                    roles: Role.fromObjectArray(data.roles as RawRole[]),
                });
                return null;
            });
        });

    await rcws.open(ws, req);
});
