import express from "express";
import {APIResponse} from "helper/APIResponse";
import {OAuth} from "helper/OAuth";
import {RocketChat} from "helper/rocketChat";

const router = express.Router();

router.get("/", (req, res) => {
    if (req.query["code"] === undefined) {
        APIResponse.fromFailure("Empty OAuth token", 400).send(res);
    } else {
        OAuth.getToken(req.originalUrl).then(
            (token) => {
                token.refresh().then();
                token.sign({
                    method: "get",
                    url: RocketChat.getWebEndpoint(),
                });

                return res.send(token.accessToken);
            },
        ).catch((e) => {
            console.debug(e.message);
            APIResponse.fromFailure("Error with OAuth token", 400).send(res);
        });
    }
});

module.exports = router;
