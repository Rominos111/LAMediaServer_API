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
    Group,
    GroupType,
    RawPartialGroup,
} from "model/group";

const schema = Validation.object({
    name: Validation.string().trim().min(3).max(30).required().messages({
        "any.required": Language.get("validation.name.required"),
        "string.empty": Language.get("validation.name.short"),
        "string.max": Language.get("validation.name.long"),
        "string.min": Language.get("validation.name.short"),
        "string.trim": Language.get("validation.name.short"),
    }),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/teams.create", auth, res, {
        name: req.body.name + "-" + randomString(),
        type: GroupType.PUBLIC,
        // TODO: `members`, par défaut seul l'utilisateur courant fait partie du groupe
    }, (r, data) => {
        return APIResponse.fromSuccess(Group.fromPartialObject(data.team as RawPartialGroup));
    }, (r, data) => {
        if (data.error === "team-name-already-exists") {
            return APIResponse.fromFailure(data.error, HTTPStatus.CONFLICT);
        } else {
            return APIResponse.fromFailure(data.error, r.status);
        }
    });
});
