/**
 * Liste les utilisateurs d'un groupe via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    listUsers,
    schema_listUsers,
} from "./list.shared";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .onClientCall(schema_listUsers, async (data, transmit) => {
            await listUsers(data.channelId as string, auth as Authentication, (users) => {
                transmit({
                    users,
                });
            }, (r) => {
                transmit({
                    error: true,
                    status: r.status,
                });
            });
        });

    await rcws.open(ws, req);
});
