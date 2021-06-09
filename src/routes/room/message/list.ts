import APIRequest from "helper/APIRequest";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";
import Attachment from "model/attachement";
import Message from "model/message";
import Reaction from "model/reaction";
import User from "model/user";

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request("GET", "/channels.messages", req.body.token, res, {
        roomId: req.body.roomId,
    }, (r, data) => {
        let messages: Message[] = [];

        for (const elt of data.messages) {
            messages.push(Message.fromFullMessage(
                elt._id,
                elt.msg,
                User.fromPartialUser(elt.u._id, elt.u.username, elt.u.name),
                elt.rid,
                new Date(elt.ts),
                Attachment.fromArray(elt.attachments),
                Reaction.fromObject(elt.reactions)
            ));
        }

        return APIResponse.fromSuccess(messages);
    });
});
