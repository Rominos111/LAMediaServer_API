/**
 * Liste les modules via REST
 */

import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {listModules} from "./list.shared";

module.exports = APIRequest.get(null, true, async (req, res, auth) => {
    await listModules(auth as Authentication, (modules) => {
        APIResponse.fromSuccess({
            modules,
        }).send(res);
    }, (r, data) => {
        APIResponse.fromFailure(data.error, r.status).send(res);
    });
});
