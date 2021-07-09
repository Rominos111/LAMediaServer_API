import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {HTTPStatus} from "helper/requestMethod";

module.exports = APIRequest.get(null, false, (_req, res) => {
    void _req;
    APIResponse.fromSuccess(null, HTTPStatus.OK, "API v1").send(res);
});
