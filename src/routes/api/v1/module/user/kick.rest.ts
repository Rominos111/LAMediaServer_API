import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    teamId: Validation.id().required(),
    userId: Validation.id().required(),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/teams.removeMember", auth, res, {
        teamId: req.body.teamId,
        userId: req.body.userId,
    });
});
