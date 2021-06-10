import APIRequest from "helper/APIRequest";
import Language from "helper/language";
import RocketChatRequest from "helper/RocketChatRequest";
import Validation from "helper/validation";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.delete(schema, (req, res) => {
    RocketChatRequest.request("POST", "/channels.delete", req, res, {
        roomId: req.body.roomId,
    });
});
