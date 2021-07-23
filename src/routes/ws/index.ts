import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketClientEvent,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {ObjectSchema} from "joi";

interface ImportData {
    schema: ObjectSchema | null,
    callback: (args: Record<string, unknown>, auth: Authentication, rcws: RocketChatWebSocket) => void,
}

interface ClientData {
    event: WebSocketClientEvent | WebSocketServerEvent,
    args: {
        [key: string]: unknown,
    }
}

module.exports = APIRequest.ws((clientWebSocket, auth, rcws) => {
    clientWebSocket.on("message", (rawData) => {
        let data = JSON.parse(rawData as string) as ClientData;

        console.debug("Event reçu:", data.event, data.args);

        if (!data.hasOwnProperty("event")) {
            return;
        }

        if (!data.hasOwnProperty("args") || data.args === null) {
            data.args = {};
        }

        const isClient = Object.values(WebSocketClientEvent).includes(data.event as WebSocketClientEvent);
        const isServer = Object.values(WebSocketServerEvent).includes(data.event as WebSocketServerEvent);

        if (isClient || isServer) {
            const file: ImportData = require(`./${data.event}.ws.ts`);
            let ok: boolean;

            if (file.schema === null) {
                ok = true;
            } else {
                const valid = file.schema.validate(data.args);
                if (valid.error) {
                    ok = false;
                    console.debug("Socket validation error:", valid.error.message);
                    rcws.transmitError("validation", valid.error.message);
                } else {
                    ok = true;
                }
            }

            if (ok) {
                file.callback(data.args, auth, rcws);
            }
        }
    });
});
