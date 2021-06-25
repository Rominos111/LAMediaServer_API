import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {User} from "model/user";

const schema = Validation.object({
    groupId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, async (req, res) => {
    await RocketChatRequest.request("GET", "/teams.members", req, res, {
        count: 0,
        teamId: req.body.groupId,
    }, (r, data) => {
        const users: User[] = [];

        for (const elt of data.members) {
            users.push(User.fromFullUser(
                elt.user._id,
                elt.user.username,
                elt.user.name,
                elt.user._id === r.currentUserId,
                elt.user.status,
            ));
        }

        return APIResponse.fromSuccess(users);
    }, (r, data) => {
        if (r.status === 400 && data.error === "team-does-not-exist") {
            return APIResponse.fromFailure("Group does not exist", 404);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status);
        }
    });
});
