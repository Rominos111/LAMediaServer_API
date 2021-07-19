/**
 * Liste les modules via WebSocket
 */

import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {
    Message,
    RawFullMessage,
} from "model/message";
import {getModules} from "./list.shared";

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .onClientCall(null, async (_data, transmit) => {
            await getModules(auth as Authentication, (modules) => {
                transmit({
                    modules,
                });
            }, (r) => {
                transmit({
                    error: true,
                    status: r.status,
                });
            });
        })
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null) => {
            transmit(Message.fromFullMessage(content as RawFullMessage, currentUserId as string).toJSON());
        });

    await rcws.open(ws, req);
});
