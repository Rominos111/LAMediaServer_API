import {
    RawVideoConferenceConnection,
    VideoConferenceConnection,
} from "model/videoConferenceConnection";

interface RawVideoConference {
    id: string,
    object: string,
    sessionId: string,
    createdAt: number | Date,
    defaultRecordingProperties: {
        name: string,
        hasAudio: boolean,
        hasVideo: boolean,
        resolution: string,
        frameRate: number,
    },
    customSessionId: string,
    connections: {
        numberOfElements: number,
        content: RawVideoConferenceConnection[],
    },
    recording: boolean,
}

class VideoConference {
    private readonly _connections: VideoConferenceConnection[];
    private readonly _createdAt: Date;
    private readonly _frameRate: number;
    private readonly _hasAudio: boolean;
    private readonly _hasVideo: boolean;
    private readonly _id: string;
    private readonly _name: string;
    private readonly _resolution: string;

    private constructor(connections: VideoConferenceConnection[],
                        createdAt: Date,
                        frameRate: number,
                        hasAudio: boolean,
                        hasVideo: boolean,
                        id: string,
                        name: string,
                        resolution: string,
    ) {
        this._connections = connections;
        this._createdAt = createdAt;
        this._frameRate = frameRate;
        this._hasAudio = hasAudio;
        this._hasVideo = hasVideo;
        this._id = id;
        this._name = name;
        this._resolution = resolution;
    }

    public get connections(): VideoConferenceConnection[] {
        return this._connections;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get frameRate(): number {
        return this._frameRate;
    }

    public get hasAudio(): boolean {
        return this._hasAudio;
    }

    public get hasVideo(): boolean {
        return this._hasVideo;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get resolution(): string {
        return this._resolution;
    }

    public static fromObject(obj: RawVideoConference): VideoConference {
        return new this(
            VideoConferenceConnection.fromArray(obj.connections.content),
            new Date(obj.createdAt),
            obj.defaultRecordingProperties.frameRate,
            obj.defaultRecordingProperties.hasAudio,
            obj.defaultRecordingProperties.hasVideo,
            obj.id,
            obj.defaultRecordingProperties.name,
            obj.defaultRecordingProperties.resolution,
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            connections: this.connections,
            createdAt: this.createdAt,
            frameRate: this.frameRate,
            hasAudio: this.hasAudio,
            hasVideo: this.hasVideo,
            id: this.id,
            name: this.name,
            resolution: this.resolution,
        };
    }
}

export {VideoConference};
