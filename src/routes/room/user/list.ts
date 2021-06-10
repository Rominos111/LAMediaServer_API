import APIRequest from "helper/APIRequest";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RocketChatRequest from "helper/RocketChatRequest";
import Validation from "helper/validation";
import User from "model/user";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request("GET", "/channels.members", req, res, {
        roomId: req.body.roomId,
    }, (r, data) => {
        let users: User[] = [];

        for (const elt of data.members) {
            users.push(User.fromFullUser(elt._id, elt.username, elt.name, elt.status, elt._updatedAt));
        }

        return APIResponse.fromSuccess(users);
    });
});
