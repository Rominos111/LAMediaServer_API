import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    invitedUserId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    moduleRoomId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.post(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/channels.invite", auth, res, {
        roomId: req.body.moduleRoomId,
    });
});
