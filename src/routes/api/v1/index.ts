import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";

module.exports = APIRequest.get(null, false, (_req, res) => {
    void _req;
    APIResponse.fromSuccess(null, 200, "API v1").send(res);
});
