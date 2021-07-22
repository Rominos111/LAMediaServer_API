import {APIRequest} from "helper/APIRequest";
import {Authentication} from "helper/authentication";
import {
    RocketChatWebSocket,
    WebSocketServerEvent,
} from "helper/rocketChatWebSocket";
import {ObjectSchema} from "joi";

interface ImportData {
    schema: ObjectSchema | null,
    callback: (args: Record<string, string>, auth: Authentication, rcws: RocketChatWebSocket) => void,
}

interface ClientData {
    event: string,
    args: {
        [key: string]: string,
    }
}

module.exports = APIRequest.ws((clientWebSocket, auth, rcws) => {
    clientWebSocket.addEventListener("message", (evt) => {
        console.log(evt.data);
        const data = evt.data as ClientData;

        if (!evt.data.hasOwnProperty("event")) {
            return;
        }

        if (Object.values(WebSocketServerEvent).includes(evt.data.event)) {
            const file: ImportData = require(`./${evt.data.event}.ws.ts`);
            let ok: boolean;

            if (file.schema === null) {
                ok = true;
            } else {
                const valid = file.schema.validate(data.args);
                if (valid.error) {
                    ok = false;
                    console.debug("Socket validation error");
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
