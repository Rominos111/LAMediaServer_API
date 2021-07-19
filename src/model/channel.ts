/**
 * Canal
 */
import {Serializable} from "helper/serializable";
import {
    Message,
    RawFullMessage,
} from "model/message";

type RawChannel = {
    _id: string,
    fname: string,
    topic: string,
    prid: string,
    msgs: number;
    usersCount: number,
    u: unknown,
    teamId?: string,
    ts: Date,
    default: boolean,
    lastMessage?: RawFullMessage,
    lm?: Date,
}

/**
 * Canal
 */
class Channel implements Serializable {
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

    private readonly _parentModuleId: string;

    private readonly _usersCount: number;

    /**
     * Constructeur
     * @param id ID
     * @param name Nom
     * @param isDefault Canal par défaut ou non
     * @param parentModuleId ID du module parent
     * @param usersCount Nombre d'utilisateurs
     * @param messagesCount Nombre de messages
     * @param lastMessage Dernier message
     */
    public constructor(id: string,
                       name: string,
                       isDefault: boolean,
                       parentModuleId: string,
                       usersCount: number,
                       messagesCount: number,
                       lastMessage: Message | null,
    ) {
        this._id = id;
        this._name = name.replace(/^(.*)-.*$/, "$1");
        this._isDefault = isDefault;
        this._lastMessage = lastMessage;
        this._parentModuleId = parentModuleId;
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

    public get parentModuleId(): string {
        return this._parentModuleId;
    }

    public get usersCount(): number {
        return this._usersCount;
    }

    public static fromFullObject(obj: RawChannel, currentUserId: string): Channel {
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
            parentModuleId: this.parentModuleId,
            usersCount: this.usersCount,
        };
    }
}

export {Channel};
export type {RawChannel};
