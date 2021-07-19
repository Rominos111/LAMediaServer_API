import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {RawChannel} from "model/channel";

const schema = Validation.object({
    channelId: Validation.string().required(),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/rooms.info", auth, res, {
        roomId: req.query.channelId,
    }, (r, data) => {
        return APIResponse.fromSuccess(data.room as RawChannel);
    });
});
