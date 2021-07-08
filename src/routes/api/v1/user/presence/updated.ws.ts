/**
 * Présence (statut) mis à jour
 */

import {APIRequest} from "helper/APIRequest";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
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
        .getSocket()
        .withToken(req.query._token as string)
        .subscribedTo("stream-notify-logged", [
            "user-status",
            false,
        ])
        .onResponse((elts) => {
            const presences: WebSocketData[] = [];
            for (const elt of elts) {
                const presenceArray = elt as (string | number | null)[];
                let message: string | null = null;

                if (presenceArray[3] !== null && presenceArray[3] !== "") {
                    message = presenceArray[3] as string;
                }

                presences.push({
                    presence: presenceFromNumber(presenceArray[2] as number),
                    presenceMessage: message,
                    user: {
                        id: presenceArray[0] as string,
                        username: presenceArray[1] as string,
                    },
                });
            }

            ws.send(JSON.stringify(presences));
        });

    rcws.open(ws);
});
