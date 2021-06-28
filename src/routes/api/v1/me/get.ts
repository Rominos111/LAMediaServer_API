import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {User} from "model/user";

module.exports = APIRequest.get(null, async (req, res) => {
    await RocketChatRequest.request("GET", "/me", req, res, null, (_r, data) => {
        return APIResponse.fromSuccess(User.fromFullUser(
            data._id,
            data.username,
            data.name,
            true,
            data.status,
        ));
    });
});
