import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {User} from "model/user";

module.exports = APIRequest.get(null, (req, res) => {
    RocketChatRequest.request("GET", "/users.list", req, res, null, (r, data) => {
        const currentUserID = r.config.headers["X-User-Id"];
        const users: User[] = [];

        for (const elt of data.users) {
            users.push(User.fromFullUser(
                elt._id,
                elt.username,
                elt.name,
                elt._id === currentUserID,
                elt.status,
                undefined,
            ));
            // FIXME: Pas de `last seen` ?
        }

        return APIResponse.fromSuccess(users);
    });
});