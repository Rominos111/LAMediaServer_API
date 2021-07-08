/**
 * Déconnecte l'utilisateur courant
 */

import {APIRequest} from "helper/APIRequest";
import {RocketChatRequest} from "helper/rocketChatRequest";

module.exports = APIRequest.post(null, true, async (req, res, auth) => {
    await RocketChatRequest.request("POST", "/logout", auth, res);
});
