/**
 * Module créé
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
    Module,
    GroupType,
} from "model/module";

interface WebSocketData {
    _id: string,
    name: string,
    msgs: number,
    usersCount: number,
    u: {
        _id: string,
        username: string,
    },
    teamId?: string,
    ts: {
        "$date": number,
    },
}

module.exports = APIRequest.ws(null, true, async (ws, req, auth) => {
    const rcws = RocketChatWebSocket
        .getSocket(req)
        .subscribedTo("stream-notify-user", [
            `${auth?.userId}/rooms-changed`,
            {"useCollection": false, "args": []},
        ])
        .onServerResponse((transmit: (data: TransmitData) => void, content: unknown, currentUserId: string | null, message) => {
            if (message.fields.args[0] === RocketChatWebSocketMessage.INSERTED) {
                const createdModule = content as WebSocketData;
                if (!createdModule.teamId) {
                    // Cette WebSocket est aussi appelée lors de la création de canaux
                    return;
                }

                transmit(Module.fromFullObject({
                    _id: createdModule.teamId,
                    createdAt: new Date(createdModule.ts.$date),
                    createdBy: {
                        _id: createdModule.u._id,
                        username: createdModule.u.username,
                    },
                    name: createdModule.name,
                    roomId: createdModule._id,
                    type: GroupType.UNKNOWN,
                    numberOfUsers: createdModule.usersCount,
                    rooms: 0,
                }));
            }
        });

    await rcws.open(ws, req);
});
