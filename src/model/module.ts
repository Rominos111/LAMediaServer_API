import {Serializable} from "helper/serializable";

enum GroupType {
    UNKNOWN = -1,
    PUBLIC = 0,
    PRIVATE = 1,
}

interface RawPartialModule {
    _id: string,
    createdAt: Date,
    createdBy: {
        _id: string,
        username: string,
    },
    name: string,
    roomId: string,
    type: GroupType | number,
}

interface RawFullModule extends RawPartialModule {
    numberOfUsers: number,
    rooms: number,
}

class Module implements Serializable {
    private readonly _createdAt: Date;
    private readonly _createdBy: string;
    private readonly _id: string;
    private readonly _name: string;
    private readonly _roomId: string;
    private readonly _roomsCount: number | null;
    private readonly _usersCount: number | null;

    private constructor(id: string,
                        name: string,
                        createdAt: Date,
                        createdBy: string,
                        roomId: string,
                        roomsCount: number | null,
                        usersCount: number | null,
    ) {
        this._id = id;
        this._name = name.replace(/^(.*)-.*$/, "$1");
        this._createdAt = createdAt;
        this._createdBy = createdBy;
        this._roomId = roomId;
        this._roomsCount = roomsCount;
        this._usersCount = usersCount;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get createdBy(): string {
        return this._createdBy;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public get roomsCount(): number | null {
        return this._roomsCount;
    }

    public get usersCount(): number | null {
        return this._usersCount;
    }

    public static fromPartialObject(obj: RawPartialModule): Module {
        return new this(
            obj._id,
            obj.name,
            obj.createdAt,
            obj.createdBy._id,
            obj.roomId,
            null,
            null,
        );
    }

    public static fromFullObject(obj: RawFullModule): Module {
        return new this(
            obj._id,
            obj.name,
            obj.createdAt,
            obj.createdBy._id,
            obj.roomId,
            obj.rooms,
            obj.numberOfUsers,
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            id: this.id,
            name: this.name,
            roomId: this.roomId,
            roomsCount: this.roomsCount,
            usersCount: this.usersCount,
        };
    }
}

export {
    Module,
    GroupType,
};
export type {
    RawFullModule,
    RawPartialModule,
};
