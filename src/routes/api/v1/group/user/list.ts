import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Validation} from "helper/validation";
import {User} from "model/user";

const schema = Validation.object({
    groupId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, (req, res) => {
    RocketChatRequest.request("GET", "/teams.members", req, res, {
        teamId: req.body.groupId,
        count: 0,
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
    });
});
