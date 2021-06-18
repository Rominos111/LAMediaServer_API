import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/RocketChatRequest";
import {Group} from "model/group";

module.exports = APIRequest.get(null, (req, res) => {
    RocketChatRequest.request("GET", "/teams.list", req, res, {
        count: 0,
    }, async (r, data) => {
        const groups: Group[] = [];
        const promises: Promise<void>[] = [];

        for (const team of data.teams) {
            let group = Group.fromFullObject(team);

            const p = RocketChatRequest.request("GET", "/rooms.getDiscussions", req, null, {
                roomId: group.roomId,
                count: 1,
            }, () => {
                groups.push(group);
                return null;
            }, (r, data) => {
                if (r.status !== 400 || data.errorType !== "error-room-not-found") {
                    console.debug("/group/list:", r.status, r.statusText, data)
                }

                return null;
            });

            promises.push(p);
        }

        for (const p of promises) {
            await p;
        }

        return APIResponse.fromSuccess(groups);
    }).then();
});
