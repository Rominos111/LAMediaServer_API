/**
 * Canal
 */
import {Serializable} from "helper/serializable";
import {
    Message,
    RawFullMessage,
} from "model/message";

type RawFullRoom = {
    _id: string,
    fname: string,
    topic: string,
    prid: string,
    msgs: number;
    usersCount: number,
    u: unknown,
    ts: Date,
    default: boolean,
    lastMessage?: RawFullMessage,
    lm: Date,
}

/**
 * Canal
 */
class Room implements Serializable {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Canal par défaut ou non
     * @private
     */
    private readonly _isDefault: boolean;

    /**
     * Dernier message
     * @private
     */
    private readonly _lastMessage: Message | null;

    private readonly _messagesCount: number;

    /**
     * Nom
     * @private
     */
    private readonly _name: string;

    private readonly _parentRoomId: string;

    private readonly _usersCount: number;

    /**
     * Constructeur
     * @param id ID
     * @param name Nom
     * @param defaultRoom Canal par défaut ou non
     * @param parentRoomId ID de la room parente
     * @param usersCount Nombre d'utilisateurs
     * @param messagesCount Nombre de messages
     * @param lastMessage Dernier message
     */
    public constructor(id: string,
                       name: string,
                       defaultRoom: boolean,
                       parentRoomId: string,
                       usersCount: number,
                       messagesCount: number,
                       lastMessage: Message | null,
    ) {
        this._id = id;
        this._name = name.replace(/^(.*)-.*$/, "$1");
        this._isDefault = defaultRoom;
        this._lastMessage = lastMessage;
        this._parentRoomId = parentRoomId;
        this._usersCount = usersCount;
        this._messagesCount = messagesCount;
    }

    public get id(): string {
        return this._id;
    }

    public get isDefault(): boolean {
        return this._isDefault;
    }

    public get lastMessage(): Message | null {
        return this._lastMessage;
    }

    public get messagesCount(): number {
        return this._messagesCount;
    }

    public get name(): string {
        return this._name;
    }

    public get parentRoomId(): string {
        return this._parentRoomId;
    }

    public get usersCount(): number {
        return this._usersCount;
    }

    public static fromFullObject(obj: RawFullRoom, currentUserId: string): Room {
        return new this(
            obj._id,
            obj.fname,
            obj.default,
            obj.prid,
            obj.usersCount,
            obj.msgs,
            obj.lastMessage ? Message.fromFullMessage(obj.lastMessage, currentUserId) : null,
        );
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            isDefault: this.isDefault,
            lastMessage: this.lastMessage,
            messagesCount: this.messagesCount,
            name: this.name,
            parentRoomId: this.parentRoomId,
            usersCount: this.usersCount,
        };
    }
}

export {Room};
export type {RawFullRoom};
