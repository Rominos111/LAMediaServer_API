import express from "express";
import axios from "axios";
import APIResponse from "helper/APIResponse"
import Validation from "helper/validation";
import RocketChat from "helper/rocketChat";
import Language from "helper/language";
import JWT from "../../helper/JWT";

let router = express.Router();

const schema = Validation.object({
    username: Validation.string().alphanum().min(3).max(32).required().messages({
        "string.empty": Language.get("validation.login.username.empty"),
        "string.min": Language.get("validation.login.username.short"),
        "string.max": Language.get("validation.login.username.long"),
        "any.required": Language.get("validation.login.username.required")
    }),
    password: Validation.string().required().messages({
        "string.empty": Language.get("validation.login.password.empty"),
        "any.required": Language.get("validation.login.password.required")
    }),
});

router.post("/", Validation.post(schema), (req, res) => {
    axios.post(RocketChat.getAPIUrl("/login"), {
        username: req.body.username,
        password: req.body.password
    }).then((r) => {
        if (r.status === 200) {
            const data = r.data.data;
            console.log(data);
            const token = JWT.create(data.userId, data.authToken, data.me.username);
            console.log(token);
            APIResponse.fromObject({
                token: token
            }).send(res);
        } else {
            APIResponse.fromError(r.statusText).send(res, r.status);
        }
    }).catch((err) => {
        console.log(err);
        if (err.code && err.code === "ECONNREFUSED") {
            APIResponse.fromError("Connection refused").send(res, 500);
        } else if (err.response) {
            APIResponse.fromError(err.response.statusText).send(res, err.response.status);
        } else {
            APIResponse.fromError("Unknown error").send(res, 500);
        }
    })
});

module.exports = router;
