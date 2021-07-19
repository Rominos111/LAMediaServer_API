/**
 * Récupère les informations d'un utilisateur en particulier
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    RawFullUser,
    User,
} from "model/user";

const schema = Validation.object({
    userId: Validation.id(),
    username: Validation.string(),
}).xor("userId", "username");

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    let payload: { userId: string } | { username: string } | null = null;
    if (req.query.userId) {
        payload = {
            userId: req.query.userId as string,
        };
    } else if (req.query.username) {
        payload = {
            username: req.query.username as string,
        };
    }

    await RocketChatRequest.request(RequestMethod.GET, "/users.info", auth, res, payload, (_r, data) => {
        void _r;
        return APIResponse.fromSuccess(User.fromFullUser(data.user as RawFullUser, auth?.userId as string));
    });
});
