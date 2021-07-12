/**
 * Récupère mes informations personnelles
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {
    CurrentUser,
    RawCurrentUser,
} from "model/currentUser";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await RocketChatRequest.request("GET", "/me", auth, res, null, (_r, data) => {
        void _r;
        return APIResponse.fromSuccess(CurrentUser.fromFullUser(data as unknown as RawCurrentUser));
    });
});
