/**
 * Liste les salons
 */

import {AxiosResponse} from "axios";
import {Authentication} from "helper/authentication";
import {Language} from "helper/language";
import {RequestMethod} from "helper/requestMethod";
import {
    FailureData,
    RocketChatRequest,
} from "helper/rocketChatRequest";
import {Validation} from "helper/validation";
import {
    Channel,
    RawChannel,
} from "model/channel";

export const schema_listModules = Validation.object({
    moduleRoomId: Validation.id().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

export async function listChannels(moduleRoomId: string,
                                   auth: Authentication,
                                   onSuccess: (channels: Channel[]) => void,
                                   onFailure: (r: AxiosResponse, data: FailureData) => void): Promise<void> {
    await RocketChatRequest.request(RequestMethod.GET, "/rooms.getDiscussions", auth, null, {
        count: 0,
        roomId: moduleRoomId,
    }, (r, data) => {
        const channels: Channel[] = [];

        for (const rawChannel of data.discussions as RawChannel[]) {
            channels.push(Channel.fromFullObject(rawChannel, r.currentUserId as string));
        }

        onSuccess(channels);
        return null;
    }, (r, data) => {
        onFailure(r, data);
        return null;
    });
}
