/**
 * Canal
 */
export default class Room {
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
     * Room par défaut ou non
     * @private
     */
    private readonly _defaultRoom: boolean;

    /**
     * Constructeur
     * @param id ID
     * @param name Nom
     * @param description Description
     * @param defaultRoom Room par défaut ou non
     */
    public constructor(id: string, name: string, description: string = "", defaultRoom: boolean = false) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._defaultRoom = defaultRoom;
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

    /**
     * Permet l'encodage en JSON
     */
    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            defaultRoom: this.defaultRoom,
        }
    }
}
