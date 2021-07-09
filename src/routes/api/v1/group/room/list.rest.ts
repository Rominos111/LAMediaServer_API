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
    RawFullRoom,
    Room,
} from "model/room";

const schema = Validation.object({
    groupRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", auth, res, {
        count: 0,
        roomId: req.body.groupRoomId,
    }, (r, data) => {
        const rooms: Room[] = [];

        for (const discussion of data.discussions as RawFullRoom[]) {
            rooms.push(Room.fromFullObject(discussion, r.currentUserId as string));
        }

        return APIResponse.fromSuccess(rooms);
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure("Room not found", HTTPStatus.NOT_FOUND);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
