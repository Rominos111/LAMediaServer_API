import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";

const schema = Validation.object({
    username: Validation.string().messages({
        "any.required": Language.get("validation.username.required"),
        "string.empty": Language.get("validation.username.empty"),
    }),
});

module.exports = APIRequest.ws(schema, async (ws, req) => {
    console.log("socket");

    RocketChatWebSocket
        .getSocket(req.query["token"] as string)
        .onResponse(() => {

        })
        .open();

    ws.on("message", (msg) => {
        console.log("message:", msg);
    })
});
