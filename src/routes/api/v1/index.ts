import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse"

module.exports = APIRequest.get(null, (_req, res) => {
    APIResponse.fromString("API v1").send(res);
});
