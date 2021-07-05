import {APIRequest} from "helper/APIRequest";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    Presence,
    presenceFromNumber,
} from "model/presence";

interface WebSocketData {
    presence: Presence,
    user: {
        id: string,
        username: string,
    }
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

                if (presenceArray[3] !== null && presenceArray[3] !== "") {
                    console.debug("Presence Rocket.chat inconnue:", presenceArray[3]);
                }

                presences.push({
                    presence: presenceFromNumber(presenceArray[2] as number),
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
