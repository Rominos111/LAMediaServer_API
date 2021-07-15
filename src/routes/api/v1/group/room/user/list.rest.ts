/**
 * Liste les utilisateurs d'un groupe
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    RawPartialUser,
    User,
} from "model/user";

const schema = Validation.object({
    roomId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/groups.members", auth, res, {
        count: 0,
        roomId: req.body.roomId,
    }, (r, data) => {
        const users: User[] = [];

        for (const elt of data.members as RawPartialUser[]) {
            users.push(User.fromPartialUser(elt, auth?.userId as string));
        }

        return APIResponse.fromSuccess({
            users,
        });
    });
});
