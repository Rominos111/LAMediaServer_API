import express from "express";
import {APIResponse} from "helper/APIResponse";
import {JWT} from "helper/JWT";
import {OAuth} from "helper/OAuth";
import {RocketChat} from "helper/rocketChat";
import {RocketChatRequest} from "helper/rocketChatRequest";

const router = express.Router();

router.get("/", (req, res) => {
    if (req.query["code"] === undefined) {
        APIResponse.fromFailure("Empty OAuth token", 400).send(res);
    } else {
        OAuth.getToken(req.originalUrl).then(
            async (token) => {
                token.refresh().then();
                token.sign({
                    method: "get",
                    url: RocketChat.getWebEndpoint(),
                });

                let query = "";
                await RocketChatRequest.request("POST", "/login", null, null, {
                    serviceName: process.env.OAUTH_SERVICE_NAME,
                    accessToken: token.accessToken,
                    expiresIn: token.data.expires_in,
                    scope: process.env.OAUTH_SCOPE,
                }, (r, data) => {
                    const newToken = JWT.createToken(data.data.userId, data.data.authToken, data.data.me.username);
                    query = "?token=" + encodeURIComponent(newToken);
                    return null;
                }, (r, data) => {
                    console.debug("OAuth RC failure:", r, data);
                    return null;
                });

                // FIXME: S'assurer qu'il n'y ait pas déjà de paramètres de query
                return res.redirect((req.query.service as string) + query);
            },
        ).catch((e) => {
            console.debug(e.message);
            APIResponse.fromFailure("Error with OAuth token", 400).send(res);
        });
    }
});

module.exports = router;
