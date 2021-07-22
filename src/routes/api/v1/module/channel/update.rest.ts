import {APIRequest} from "helper/APIRequest";
import {RequestMethod} from "helper/requestMethod";
import {RocketChatRequest} from "helper/rocketChatRequest";
import {randomString} from "helper/utils";
import {Validation} from "helper/validation";

const schema = Validation.object({
    channelId: Validation.id().required(),
    name: Validation.string().required(),
});

module.exports = APIRequest.patch(schema, true, async (req, res, auth) => {
    await RocketChatRequest.request(RequestMethod.POST, "/rooms.saveRoomSettings", auth, res, {
        rid: req.body.channelId,
        roomName: req.body.name + "-" + randomString(), // On suffixe tous les noms pour éviter des conflits
    });
});
