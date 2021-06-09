/**
 * Canal
 */
import Message from "model/message";

export default class Channel {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Nom
     * @private
     */
    private readonly _name: string;

    /**
     * Description
     * @private
     */
    private readonly _description: string;

    /**
     * Canal par défaut ou non
     * @private
     */
    private readonly _defaultRoom: boolean;

    /**
     * Dernier message
     * @private
     */
    private readonly _lastMessage: Message | null;

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
                       description: string = "",
                       defaultRoom: boolean = false,
                       lastMessage: Message | null = null) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._defaultRoom = defaultRoom;
        this._lastMessage = lastMessage;
    }

    public get id() {
        return this._id;
    }

    public get name() {
        return this._name;
    }

    public get description() {
        return this._description;
    }

    public get defaultRoom() {
        return this._defaultRoom;
    }

    public get lastMessage() {
        return this._lastMessage;
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): Object {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            defaultRoom: this.defaultRoom,
            lastMessage: this.lastMessage,
        }
    }
}
