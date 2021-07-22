import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {
    RawRole,
    Role,
} from "model/role";

module.exports = APIRequest.ws(null, async (ws, req, auth, rcws) => {
    rcws.addSubscription(
        "stream-notify-logged",
        [
            "user-status",
            false,
        ], () => {
        });

    rcws.addClientCall(
        WebSocketClientEvent.LIST_ROLES,
        null,
        async (_socket, _data, transmit) => {
            void _data;
            await RocketChatRequest.request(RequestMethod.GET, "/roles.list", auth, null, null, (_r, data) => {
                void _r;
                transmit({
                    roles: Role.fromObjectArray(data.roles as RawRole[]),
                }, WebSocketServerEvent.ROLE_LIST);
                return null;
            });
        },
    );
});
