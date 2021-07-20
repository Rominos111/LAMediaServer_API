/**
 * Liste les connexions à une vidéoconférence
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Language} from "helper/language";
import {OpenVidu} from "helper/openVidu";
import {
    HTTPStatus,
    isValidStatusCode,
    RequestMethod,
} from "helper/requestMethod";
import {Validation} from "helper/validation";
import * as https from "https";
import {VideoConferenceConnection} from "model/videoConferenceConnection";

const schema = Validation.object({
    sessionId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

module.exports = APIRequest.get(schema, true, async (req, res, _auth) => {
    const options = OpenVidu.getOptions(RequestMethod.GET, `/openvidu/api/sessions/${req.query.sessionId}/connection`);
    let data = "";

    const request = https.request(options, (r) => {
        r.on("data", (chunk) => {
            data += chunk;
        });

        r.on("end", () => {
            if (r.statusCode === HTTPStatus.NOT_FOUND) {
                APIResponse.fromFailure(Language.get("videoconference.not-found"), HTTPStatus.NOT_FOUND).send(res);
            } else if (isValidStatusCode(r.statusCode as number)) {
                const obj = JSON.parse(data);
                const payload = {
                    connections: VideoConferenceConnection.fromArray(obj.content),
                };
                APIResponse.fromSuccess(payload, r.statusCode).send(res);
            } else {
                console.warn("OpenVidu list error code", r.statusMessage);
                APIResponse.fromFailure(r.statusMessage as string, r.statusCode as number).send(res);
            }
        });
    });

    request.on("error", (err) => {
        console.warn("OpenVidu list error", err);
        APIResponse.fromFailure(err.message, HTTPStatus.BAD_REQUEST).send(res);
    });

    request.write(JSON.stringify({
        sessionId: req.query.sessionId,
    }));

    request.end();
});
