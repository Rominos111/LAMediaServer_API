/**
 * Liste les utilisateurs d'un groupe via REST
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {HTTPStatus} from "helper/requestMethod";
import {
    listUsers,
    schema_listUsers,
} from "./list.shared";

module.exports = APIRequest.get(schema_listUsers, true, async (req, res, auth) => {
    await listUsers(req.query.channelId as string, auth as Authentication, (users) => {
        APIResponse.fromSuccess({
            users,
        }).send(res);
    }, (r, data) => {
        if (r.status === HTTPStatus.BAD_REQUEST && data.errorType === "error-room-not-found") {
            APIResponse.fromFailure("Not Found", HTTPStatus.NOT_FOUND).send(res);
        } else {
            APIResponse.fromFailure(r.statusText, r.status).send(res);
        }
    });
});
