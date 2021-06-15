import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    RequestMethod,
    RocketChatRequest,
} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";
import {Room} from "model/room";

const schema = Validation.object({
    groupRoomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", req, res, {
        roomId: req.body.groupRoomId,
        count: 0,
    }, (r, data) => {
        const rooms: Room[] = [];

        for (const discussion of data.discussions) {
            rooms.push(Room.fromFullObject(discussion, <string>r.currentUserId));
        }

        return APIResponse.fromSuccess(rooms);
    });
});
