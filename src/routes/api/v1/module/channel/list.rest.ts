/**
 * Liste les salons
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
    Channel,
    RawChannel,
} from "model/channel";

const schema = Validation.object({
    moduleRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", auth, res, {
        count: 0,
        roomId: req.body.moduleRoomId,
    }, (r, data) => {
        const channels: Channel[] = [];

        for (const rawChannel of data.discussions as RawChannel[]) {
            channels.push(Channel.fromFullObject(rawChannel, r.currentUserId as string));
        }

        return APIResponse.fromSuccess({
            channels: channels,
        });
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure("Channel not found", HTTPStatus.NOT_FOUND);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
