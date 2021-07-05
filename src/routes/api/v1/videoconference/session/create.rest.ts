import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {OpenVidu} from "helper/openVidu";
import {
    isValidStatusCode,
    RequestMethod,
} from "helper/requestMethod";
import * as https from "https";
import {VideoConference} from "model/videoConference";

module.exports = APIRequest.post(null, true, async (req, res, _auth) => {
    let data = "";
    const request = https.request(OpenVidu.getOptions(RequestMethod.POST, "/openvidu/api/sessions"), (r) => {
        r.on("data", (chunk) => {
            data += chunk;
        });

        r.on("end", () => {
            if (isValidStatusCode(r.statusCode as number)) {
                APIResponse.fromSuccess(VideoConference.fromObject(JSON.parse(data)), r.statusCode).send(res);
            } else {
                console.debug(r.statusCode, r.statusMessage);
                APIResponse.fromFailure(r.statusMessage, r.statusCode).send(res);
            }
        });
    });

    request.on("error", (e) => {
        console.log(e.message);
        APIResponse.fromFailure(e.message, 400).send(res);
    });

    request.end();
});
