/**
 * Canal
 */
import {Message} from "model/message";

/**
 * Canal
 */
class Channel {
    /**
     * Canal par défaut ou non
     * @private
     */
    private readonly _defaultRoom: boolean;

    /**
     * Description
     * @private
     */
    private readonly _description: string;

    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Dernier message
     * @private
     */
    private readonly _lastMessage: Message | undefined;

    /**
     * Nom
     * @private
     */
    private readonly _name: string;

    /**
     * Constructeur
     * @param id ID
     * @param name Nom
     * @param description Description
     * @param defaultRoom Canal par défaut ou non
     * @param lastMessage Dernier message
     */
    public constructor(id: string,
                       name: string,
                       description = "",
                       defaultRoom = false,
                       lastMessage: Message | undefined = undefined) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._defaultRoom = defaultRoom;
        this._lastMessage = lastMessage;
    }

    public get defaultRoom(): boolean {
        return this._defaultRoom;
    }

    public get description(): string {
        return this._description;
    }

    public get id(): string {
        return this._id;
    }

    public get lastMessage(): Message | undefined {
        return this._lastMessage;
    }

    public get name(): string {
        return this._name;
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            defaultRoom: this.defaultRoom,
            lastMessage: this.lastMessage,
        }
    }
}

export {Channel};
