interface RawVideoConferenceConnection {
    id: string,
    object: string,
    status: string | VideoConferenceConnectionStatus,
    connectionId: string,
    sessionId: string,
    createdAt: number | Date,
    type: string | VideoConferenceConnectionType,
    serverData: string,
    token: string,
}

enum VideoConferenceConnectionStatus {
    PENDING = "pending",
}

enum VideoConferenceConnectionType {
    WEBRTC = "WEBRTC",
}

class VideoConferenceConnection {
    private readonly _createdAt: Date;
    private readonly _id: string;
    private readonly _parentSessionId: string;
    private readonly _serverData: string;
    private readonly _status: VideoConferenceConnectionStatus;
    private readonly _targetWebSocketURL: string;
    private readonly _token: string;

    constructor(createdAt: Date,
                id: string,
                parentSessionId: string,
                serverData: string,
                status: VideoConferenceConnectionStatus,
                targetWebSocketURL: string,
                token: string,
    ) {
        this._createdAt = createdAt;
        this._id = id;
        this._parentSessionId = parentSessionId;
        this._serverData = serverData;
        this._status = status;
        this._targetWebSocketURL = targetWebSocketURL;
        this._token = token;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get id(): string {
        return this._id;
    }

    public get parentSessionId(): string {
        return this._parentSessionId;
    }

    public get serverData(): string {
        return this._serverData;
    }

    public get status(): VideoConferenceConnectionStatus {
        return this._status;
    }

    public get targetWebSocketURL(): string {
        return this._targetWebSocketURL;
    }

    public get token(): string {
        return this._token;
    }

    public static fromObject(obj: RawVideoConferenceConnection): VideoConferenceConnection {
        let token = obj.token;
        if (token.includes(process.env.OPENVIDU_ADDRESS as string)) {
            token = token.replace(/^.+[?&]token=(.*?)(&.*)?$/, "$1");
        }

        let targetWebSocketURL = "" +
            `${process.env.OPENVIDU_WEBSOCKET_PROTOCOL}://` +
            `${process.env.OPENVIDU_ADDRESS}/openvidu` +
            `?sessionId=${obj.sessionId}&token=${token}`;

        return new this(
            new Date(obj.createdAt),
            obj.id,
            obj.serverData,
            obj.sessionId,
            obj.status as VideoConferenceConnectionStatus,
            targetWebSocketURL,
            token,
        );
    }

    public static fromArray(arr: RawVideoConferenceConnection[]): VideoConferenceConnection[] {
        const connections: VideoConferenceConnection[] = [];

        for (const obj of arr) {
            connections.push(this.fromObject(obj));
        }

        return connections;
    }

    public toJSON(): Record<string, unknown> {
        return {
            createdAt: this.createdAt,
            id: this.id,
            serverData: this.serverData,
            sessionId: this.parentSessionId,
            status: this.status,
            targetWebSocketURL: this.targetWebSocketURL,
            token: this.token,
        };
    }
}

export {VideoConferenceConnection};
export type {RawVideoConferenceConnection};
