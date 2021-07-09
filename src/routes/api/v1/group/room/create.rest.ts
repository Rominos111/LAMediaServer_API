import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {HTTPStatus} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {randomString} from "helper/utils";
import {Validation} from "helper/validation";
import {
    RawFullRoom,
    Room,
} from "model/room";

const schema = Validation.object({
    groupRoomId: Validation.string().required(),
    name: Validation.string().required().messages({
        "any.required": Language.get("validation.name.required"),
    }),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request("POST", "/rooms.createDiscussion", auth, res, {
        prid: req.body.groupRoomId,
        t_name: req.body.name + "-" + randomString(),
    }, (r, data) => {
        const room = Room.fromFullObject(data.discussion as RawFullRoom, r.currentUserId as string);
        return APIResponse.fromSuccess(room, HTTPStatus.OK);
    });
});
