/**
 * Déconnecte l'utilisateur courant
 */

import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";

module.exports = APIRequest.post(null, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/logout", auth, res);
});
