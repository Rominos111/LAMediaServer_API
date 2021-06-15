import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Group} from "model/group";

module.exports = APIRequest.get(null, (req, res) => {
    RocketChatRequest.request("GET", "/teams.list", req, res, {
        count: 0,
    }, (r, data) => {
        const groups: Group[] = [];

        for (const team of data.teams) {
            groups.push(Group.fromFullObject(team));
        }

        return APIResponse.fromSuccess(groups);
    });
});
