/**
 * Liste les messages
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    HTTPStatus,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    Message,
    RawFullMessage,
} from "model/message";

const schema = Validation.object({
    channelId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/groups.history", auth, res, {
        count: 0, // FIXME: Ajouter une limite
        roomId: req.body.channelId,
    }, (r, data) => {
        const messages: Message[] = [];

        for (const rawMessage of data.messages as (RawFullMessage & { t?: unknown })[]) {
            if (!rawMessage.hasOwnProperty("t")) {
                // FIXME: Gérer ces messages spéciaux, comme les invitations
                messages.push(Message.fromFullMessage(rawMessage, r.currentUserId as string));
            }
        }

        return APIResponse.fromSuccess({
            messages,
        });
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure("Not Found", HTTPStatus.NOT_FOUND);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
