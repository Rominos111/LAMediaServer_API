import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {JWT} from "helper/JWT";
import {Language} from "helper/language";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";

const schema = Validation.object({
    accessToken: Validation.string().required(),
    expiresIn: Validation.date().timestamp().required(),
    refreshToken: Validation.string().required(),
});

module.exports = APIRequest.post(schema, false, async (req, res) => {
    await RocketChatRequest.request("POST", "/login", null, res, {
        accessToken: req.body.accessToken,
        expiresIn: req.body.expiresIn.getTime(),
        serviceName: process.env.OAUTH_SERVICE_NAME,
        scope: process.env.OAUTH_SCOPE,
    }, (r, data) => {
        const token = JWT.createToken(data.data.userId, data.data.authToken, data.data.me.username);
        return APIResponse.fromSuccess({
            token,
        });
    }, (r, data) => {
        if (r.status === 401) {
            // Ne devrait plus se produire maintenant que OAuth est utilisé
            console.debug("Erreur 401 lors de la connexion");
            return APIResponse.fromFailure(Language.get("login.unauthorized"), r.status, data);
        } else {
            return APIResponse.fromFailure(r.statusText, r.status, data);
        }
    });
});
