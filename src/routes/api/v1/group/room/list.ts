import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RequestMethod} from "helper/requestMethod";
import {
    RocketChatRequest,
} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {Room} from "model/room";

const schema = Validation.object({
    groupRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, async (req, res) => {
    // FIXME: Utiliser `.query` (cf. `app.js`)
    await RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", req, res, {
        count: 0,
        roomId: req.body.groupRoomId,
    }, (r, data) => {
        const rooms: Room[] = [];

        for (const discussion of data.discussions) {
            rooms.push(Room.fromFullObject(discussion, r.currentUserId as string));
        }

        return APIResponse.fromSuccess(rooms);
    }, (r, data) => {
        if (r.status === 400 && data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure("Room not found", 404);
        } else {
            console.debug(data);
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
