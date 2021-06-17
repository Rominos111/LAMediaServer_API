import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    groupId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.delete(schema, (req, res) => {
    RocketChatRequest.request("POST", "/teams.delete", req, res, {
        teamId: req.body.groupId,
    });
});
