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
    RawFullUser,
    RawPartialUser,
    User,
} from "model/user";

export const schema_listUsers = Validation.object({
    channelId: Validation.id().required().messages({
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
    }, async (r, data) => {
        const userId = auth?.userId as string;
        const members = data.members as RawPartialUser[];

        const users: (User | null)[] = [];
        const promises: Promise<void>[] = [];

        for (let i = 0; i < members.length; ++i) {
            users.push(null);
            promises.push(
                RocketChatRequest.request(RequestMethod.GET, "/users.info", auth, null, {
                    userId: members[i]._id,
                }, (_r, data) => {
                    void _r;
                    users[i] = User.fromFullUser(data.user as RawFullUser, userId);
                    return null;
                }),
            );
        }

        for (const p of promises) {
            await p;
        }

        onSuccess(users.filter((user) => user !== null) as User[]);
        return null;
    }, (r, data) => {
        onFailure(r, data);
        return null;
    });
}
