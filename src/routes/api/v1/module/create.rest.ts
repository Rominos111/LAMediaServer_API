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
    Module,
    GroupType,
    RawPartialModule,
} from "model/module";

const schema = Validation.object({
    name: Validation.string().trim().required().messages({
        "any.required": Language.get("validation.name.required"),
        "string.empty": Language.get("validation.name.short"),
        "string.max": Language.get("validation.name.long"),
        "string.min": Language.get("validation.name.short"),
        "string.trim": Language.get("validation.name.short"),
    }),
    memberIds: Validation.array().items(Validation.string().trim()).required(),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/teams.create", auth, res, {
        name: req.body.name + "-" + randomString(), // On suffixe tous les noms pour éviter des conflits
        type: GroupType.PUBLIC,
        members: req.body.memberIds,
    }, (r, data) => {
        return APIResponse.fromSuccess(Module.fromPartialObject(data.team as RawPartialModule));
    }, (r, data) => {
        // N'est pas censé arriver grâce au suffixe
        if (data.error === "team-name-already-exists") {
            return APIResponse.fromFailure(data.error, HTTPStatus.CONFLICT);
        } else {
            return APIResponse.fromFailure(data.error, r.status);
        }
    });
});
