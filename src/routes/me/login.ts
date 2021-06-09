import APIRequest from "helper/APIRequest";
import APIResponse from "helper/APIResponse"
import JWT from "helper/JWT";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";

const schema = Validation.object({
    username: Validation.string().alphanum().min(3).max(32).required().messages({
        "string.empty": Language.get("validation.username.empty"),
        "string.min": Language.get("validation.username.short"),
        "string.max": Language.get("validation.username.long"),
        "any.required": Language.get("validation.username.required")
    }),
    password: Validation.string().required().messages({
        "string.empty": Language.get("validation.password.empty"),
        "any.required": Language.get("validation.password.required")
    }),
});

module.exports = APIRequest.post(schema, (req, res) => {
    RocketChatRequest.request("POST", "/login", null, res, {
        username: req.body.username,
        password: req.body.password
    }, (r, data) => {
        const token = JWT.createToken(data.data.userId, data.data.authToken, data.data.me.username);
        return APIResponse.fromSuccess({
            token: token
        });
    });
});
