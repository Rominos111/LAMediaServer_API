import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    Module,
    RawFullModule,
} from "model/module";

const schema = Validation.object({
    moduleId: Validation.string().required(),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/teams.info", auth, res, {
        teamId: req.query.moduleId,
    }, (r, data) => {
        return APIResponse.fromSuccess(Module.fromFullObject(data.teamInfo as RawFullModule));
    });
});
