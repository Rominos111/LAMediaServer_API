/**
 * Message envoyé
 */

import {APIRequest} from "helper/APIRequest";
import {Language} from "helper/language";
import {
    RocketChatWebSocket,
    RocketChatWebSocketMessage,
    TransmitData,
} from "helper/rocketChatWebSocket";
import {Validation} from "helper/validation";
import {
    Group,
    GroupType,
} from "model/group";

const schema = Validation.object({
    userId: Validation.string().required().messages({
        "any.required": Language.get("validation.id.required"),
    }),
});

interface WebSocketData {
    _id: string,
    name: string,
    msgs: number,
    usersCount: number,
    u: {
        _id: string,
        username: string,
    },
    ts: {
        "$date": number,
    },
    teamId: string,
}

module.exports = APIRequest.ws(schema, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-user", [
            `${req.query.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.INSERTED) {
                const group = content as WebSocketData;
                transmit(Group.fromFullObject({
                    _id: group.teamId,
                    createdAt: new Date(group.ts.$date),
                    createdBy: {
                        _id: group.u._id,
                        username: group.u.username,
                    },
                    name: group.name,
                    roomId: group._id,
                    type: GroupType.UNKNOWN,
                    numberOfUsers: group.usersCount,
                    rooms: 0,
                }));
            }
        });

    await rcws.open(ws, req);
});
