import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {User} from "model/user";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/me", auth, res, null, (_r, data) => {
        void _r;
        return APIResponse.fromSuccess(User.fromFullUser(
            data._id,
            data.username,
            data.name,
            true,
            data.status,
        ));
    });
});
