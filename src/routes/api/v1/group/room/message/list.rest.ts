import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {Message} from "model/message";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/groups.history", auth, res, {
        count: 0, // FIXME: Ajouter une limite
        roomId: req.body.roomId,
    }, (r, data) => {
        const messages: Message[] = [];

        for (const rawMessage of data.messages) {
            if (rawMessage.t === undefined) {
                // FIXME: Gérer ces messages spéciaux, comme les invitations
                messages.push(Message.fromFullMessage(rawMessage, r.currentUserId as string));
            }
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
