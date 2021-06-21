import {APIRequest} from "helper/APIRequest";
import {RocketChatRequest} from "helper/RocketChatRequest";

module.exports = APIRequest.post(null, async (req, res) => {
    await RocketChatRequest.request("POST", "/logout", req, res);
});
