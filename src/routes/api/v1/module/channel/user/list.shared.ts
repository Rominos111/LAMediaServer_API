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
    RawPartialUser,
    User,
} from "model/user";

export const schema_listUsers = Validation.object({
    channelId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

export async function listUsers(channelId: string,
                                auth: Authentication,
                                onSuccess: (users: User[]) => void,
                                onFailure: (r: AxiosResponse, data: FailureData) => void): Promise<void> {
    await RocketChatRequest.request(RequestMethod.GET, "/groups.members", auth, null, {
        count: 0,
        roomId: channelId,
    }, (r, data) => {
        const users: User[] = [];

        for (const elt of data.members as RawPartialUser[]) {
            users.push(User.fromPartialUser(elt, auth?.userId as string));
        }

        onSuccess(users);
        return null;
    }, (r, data) => {
        onFailure(r, data);
        return null;
    });
}
