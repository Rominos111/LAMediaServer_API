import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {
    HTTPStatus,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    channelId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.delete(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/groups.delete", auth, res, {
        roomId: req.body.channelId,
    }, null, (r, data) => {
        if (data.errorType === "error-room-not-found") {
            return APIResponse.fromFailure(data.error, HTTPStatus.NOT_FOUND);
        } else if (data.errorType === "error-not-allowed") {
            return APIResponse.fromFailure(data.error, HTTPStatus.UNAUTHORIZED);
        } else {
            return APIResponse.fromFailure(data.error, HTTPStatus.BAD_REQUEST);
        }
    });
});
