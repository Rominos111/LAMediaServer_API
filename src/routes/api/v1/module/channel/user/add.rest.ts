import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    roomId: Validation.id().required(),
    userId: Validation.id().required(),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/groups.invite", auth, res, {
        roomId: req.body.roomId,
        userId: req.body.userId,
    });
});
