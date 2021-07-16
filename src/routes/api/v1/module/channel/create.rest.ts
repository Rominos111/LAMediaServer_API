import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    HTTPStatus,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {randomString} from "helper/utils";
import {Validation} from "helper/validation";
import {
    RawChannel,
    Channel,
} from "model/channel";

const schema = Validation.object({
    moduleRoomId: Validation.string().required(),
    name: Validation.string().required().messages({
        "any.required": Language.get("validation.name.required"),
    }),
    memberIds: Validation.array().items(Validation.string().trim()).required(),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/rooms.createDiscussion", auth, res, {
        prid: req.body.moduleRoomId,
        t_name: req.body.name + "-" + randomString(),
        users: req.body.memberIds,
        reply: "",
    }, (r, data) => {
        const channel = Channel.fromFullObject(data.discussion as RawChannel, r.currentUserId as string);
        return APIResponse.fromSuccess(channel, HTTPStatus.OK);
    });
});
