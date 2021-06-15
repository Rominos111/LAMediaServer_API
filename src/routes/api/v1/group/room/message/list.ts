import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";
import {Message} from "model/message";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request("GET", "/channels.messages", req, res, {
        roomId: req.body.roomId,
    }, (r, data) => {
        const messages: Message[] = [];

        for (const elt of data.messages) {
            messages.push(Message.fromFullMessage(elt, r.currentUserId as string));
        }

        return APIResponse.fromSuccess(messages);
    }, (r, data) => {
        if (r.status === 400 && data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure("Not Found", 404);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
