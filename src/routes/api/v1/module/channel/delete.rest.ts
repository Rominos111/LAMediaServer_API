import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    channelId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.delete(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/channels.delete", auth, res, {
        roomId: req.body.channelId,
    });
});
