/**
 * Envoi d'un message
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocket,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {
    Message,
    RawFullMessage,
} from "model/message";
import {schema_sendMessage} from "./send.shared";

module.exports = APIRequest.ws(null, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .onClientCall(schema_sendMessage, (data) => {
            rcws.callMethod("sendMessage", {
                msg: (data.message as string).trim(),
                rid: data.roomId,
            });
        })
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null) => {
            transmit(Message.fromFullMessage(content as RawFullMessage, currentUserId as string).toJSON());
        });

    await rcws.open(ws, req);
});
