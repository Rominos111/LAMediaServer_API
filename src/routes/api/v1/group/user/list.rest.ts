/**
 * Liste les utilisateurs d'un groupe
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {HTTPStatus} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    RawFullUser,
    User,
} from "model/user";

const schema = Validation.object({
    groupId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/teams.members", auth, res, {
        count: 0,
        teamId: req.body.groupId,
    }, (r, data) => {
        const users: User[] = [];

        for (const elt of data.members as { user: RawFullUser, roles: string[] }[]) {
            users.push(User.fromFullUser(elt.user, auth?.userId as string, elt.roles));
        }

        return APIResponse.fromSuccess({
            users,
        });
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.error === "team-does-not-exist") {
            return APIResponse.fromFailure("Group does not exist", HTTPStatus.NOT_FOUND);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
