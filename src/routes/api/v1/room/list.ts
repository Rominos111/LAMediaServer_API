import {APIRequest} from "helper/APIRequest";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod, RocketChatRequest} from "helper/RocketChatRequest";
import {Channel} from "model/channel";
import {Message} from "model/message";

module.exports = APIRequest.get(null, (req, res) => {
    RocketChatRequest.request(RequestMethod.GET, "/rooms.get", req, res, null, (r, data) => {
        let rooms: Channel[] = [];

        for (const elt of data.update) {
            rooms.push(new Channel(
                elt._id,
                elt.name,
                elt.description,
                elt.default,
                Message.fromPartialMessage(elt.lastMessage))
            );
        }

        return APIResponse.fromSuccess(rooms);
    });
});
