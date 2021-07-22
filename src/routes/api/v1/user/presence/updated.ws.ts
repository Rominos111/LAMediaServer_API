/**
 * Présence (statut) mis à jour
 */

import {APIRequest} from "helper/APIRequest";
import {
    RocketChatWebSocket,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {
    Presence,
    presenceFromNumber,
} from "model/presence";

interface WebSocketData {
    presence: Presence,
    presenceMessage: string | null,
    user: {
        id: string,
        username: string,
    },
}

module.exports = APIRequest.ws(null, true, async (ws, req) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-logged", [
            "user-status",
            false,
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown) => {
            const presenceArray = content as (string | number | null)[];
            let message: string | null = null;

            if (presenceArray[3] !== null && presenceArray[3] !== "") {
                message = presenceArray[3] as string;
            }

            transmit({
                presence: presenceFromNumber(presenceArray[2] as number),
                presenceMessage: message,
                user: {
                    id: presenceArray[0] as string,
                    username: presenceArray[1] as string,
                },
            });
        });

    await rcws.open(ws, req);
});
