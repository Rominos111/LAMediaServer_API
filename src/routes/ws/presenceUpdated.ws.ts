/**
 * Présence (statut) mis à jour
 */

import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    TransmitData,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {presenceFromNumber} from "model/presence";

module.exports = {
    schema: null,
    callback: async (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => {
        rcws.addSubscription(
            "stream-notify-logged",
            [
                "user-status",
                false,
            ],
            (transmit: (data: TransmitData, evt: WebSocketServerEvent) => void, content: unknown) => {
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
                }, WebSocketServerEvent.PRESENCE_UPDATED);
            },
        );
    },
};
