import APIRequest from "helper/APIRequest";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required")
    }),
});

module.exports = APIRequest.post(schema, (req, res) => {
    RocketChatRequest.request("POST", "/logout", req.body.token, res);
});
