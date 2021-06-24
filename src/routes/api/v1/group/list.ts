import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Group} from "model/group";

module.exports = APIRequest.get(null, async (req, res) => {
    await RocketChatRequest.request("GET", "/teams.list", req, res, {
        count: 0,
    }, async (r, data) => {
        const groups: (Group | null)[] = [];
        const promises: Promise<void>[] = [];

        for (let i = 0; i < data.teams.length; ++i) {
            const team = data.teams[i];
            const group = Group.fromFullObject(team);
            groups.push(null);

            const p = RocketChatRequest.request("GET", "/rooms.getDiscussions", req, null, {
                count: 1,
                roomId: group.roomId,
            }, () => {
                groups[i] = group;
                return null;
            }, (r, data) => {
                if (r.status !== 400 || data.errorType !== "error-room-not-found") {
                    console.debug("/group/list:", r.status, r.statusText, data);
                }

                return null;
            });

            promises.push(p);
        }

        for (const p of promises) {
            await p;
        }

        const groupsFiltered = groups.filter((group) => group !== null);
        return APIResponse.fromSuccess(groupsFiltered);
    });
});
