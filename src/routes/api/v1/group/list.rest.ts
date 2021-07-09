/**
 * Liste les groupes
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {HTTPStatus} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    Group,
    RawFullGroup,
} from "model/group";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/teams.list", auth, res, {
        count: 0,
    }, async (r, data) => {
        const groups: (Group | null)[] = [];
        const promises: Promise<void>[] = [];

        const teams = data.teams as RawFullGroup[];

        for (let i = 0; i < teams.length; ++i) {
            const team: RawFullGroup = teams[i];
            const group = Group.fromFullObject(team);
            groups.push(null);

            const p = RocketChatRequest.request("GET", "/rooms.getDiscussions", auth, null, {
                count: 1,
                roomId: group.roomId,
            }, () => {
                groups[i] = group;
                return null;
            }, (r, data) => {
                if (r.status !== HTTPStatus.BAD_REQUEST || data.errorType !== "error-room-not-found") {
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
