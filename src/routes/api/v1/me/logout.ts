import {APIRequest} from "helper/APIRequest";
import {RocketChatRequest} from "helper/RocketChatRequest";

module.exports = APIRequest.post(null, (req, res) => {
    RocketChatRequest.request("POST", "/logout", req, res);
});
