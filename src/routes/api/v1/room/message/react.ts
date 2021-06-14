import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    messageId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
    emojiName: Validation.string().required().messages({
        "any.required": Language.get("validation.emoji.required"),
        "string.empty": Language.get("validation.emoji.required"),
    }),
    operation: Validation.string().valid("set", "clear").required().messages({
        "any.only": Language.get("validation.reaction-operation.invalid"),
        "any.required": Language.get("validation.reaction-operation.required"),
    }),
});

module.exports = APIRequest.post(schema, (req, res) => {
    console.log(req.body.operation);
    RocketChatRequest.request("POST", "/chat.react", req, res, {
        emoji: req.body.emojiName.trim(),
        messageId: req.body.messageId,
        shouldReact: req.body.operation.toLowerCase() === "set",
    });
});
