/**
 * Liste les salons
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {HTTPStatus} from "helper/requestMethod";
import {
    listChannels,
    schema_listModules,
} from "./list.shared";

module.exports = APIRequest.get(schema_listModules, true, async (req, res, auth) => {
    await listChannels(req.query.moduleRoomId as string, auth as Authentication, (channels) => {
        APIResponse.fromSuccess({
            channels: channels,
        }).send(res);
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.errorType === "error-room-not-found") {
            APIResponse.fromFailure("Channel not found", HTTPStatus.NOT_FOUND).send(res);
        } else {
            APIResponse.fromFailure(r.statusText, r.status).send(res);
        }
    });
});
