/**
 * Liste tous les utilisateurs
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    RawFullUser,
    User,
} from "model/user";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/users.list", auth, res, null, (r, data) => {
        const users: User[] = [];

        for (const elt of data.users as RawFullUser[]) {
            // TODO: Gérer ces roles
            users.push(User.fromFullUser(elt, auth?.userId as string));
        }

        return APIResponse.fromSuccess({
            users,
        });
    });
});
