/**
 * Liste les modules
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {
    HTTPStatus,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    Module,
    RawFullModule,
} from "model/module";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.GET, "/teams.list", auth, res, {
        count: 0,
    }, async (r, data) => {
        const modules: (Module | null)[] = [];
        const promises: Promise<void>[] = [];

        const teams = data.teams as RawFullModule[];

        for (let i = 0; i < teams.length; ++i) {
            const team: RawFullModule = teams[i];
            const currentModule = Module.fromFullObject(team);
            modules.push(null);

            // Certaines teams apparaissent alors qu'elles ont déjà été supprimées.
            //  On essaie donc de récupérer leur salon principal, en cas d'échec c'est une team "fantôme"
            const p = RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", auth, null, {
                count: 1,
                roomId: currentModule.roomId,
            }, () => {
                modules[i] = currentModule;
                return null;
            }, (r, data) => {
                if (r.status !== HTTPStatus.BAD_REQUEST || data.errorType !== "error-room-not-found") {
                    // Groupes fantômes
                    // FIXME: Essayer de supprimer ces groupes
                }

                return null;
            });

            promises.push(p);
        }

        for (const p of promises) {
            await p;
        }

        const modulesFiltered = modules.filter((mod) => mod !== null);
        return APIResponse.fromSuccess({
            modules: modulesFiltered,
        });
    });
});
