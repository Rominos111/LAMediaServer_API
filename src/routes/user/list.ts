import APIRequest from "helper/APIRequest";
import APIResponse from "helper/APIResponse";
import Language from "helper/language";
import RocketChatRequest from "helper/request";
import Validation from "helper/validation";
import User from "model/user";

const schema = Validation.object({
    token: Validation.jwt().required().messages({
        "any.required": Language.get("validation.token.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request("GET", "/users.list", req.body.token, res, null, (r, data) => {
        let users: User[] = [];

        for (const elt of data.users) {
            users.push(User.fromFullUser(elt._id, elt.username, elt.name, elt.status, undefined));
            // FIXME: Pas de `last seen` ?
        }

        return APIResponse.fromSuccess(users);
    });
});
