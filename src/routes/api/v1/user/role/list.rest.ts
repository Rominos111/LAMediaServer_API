import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    RawRole,
    Role,
} from "model/role";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/roles.list", auth, res, null, (r, data) => {
        return APIResponse.fromSuccess({
            roles: Role.fromObjectArray(data.roles as RawRole[]),
        });
    });
});
