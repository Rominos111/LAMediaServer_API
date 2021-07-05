/**
 * Utilisateur
 */
import {Presence} from "model/presence";

class User {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Utilisateur courant ou non
     * @private
     */
    private readonly _isMe: boolean;

    /**
     * Nom complet
     * @private
     */
    private readonly _name: string;

    /**
     * Statut
     * @private
     */
    private readonly _status: Presence | undefined;

    /**
     * Nom d'utilisateur
     * @private
     */
    private readonly _username: string;

    private constructor(id: string,
                        username: string,
                        name: string,
                        isMe: boolean,
                        status: Presence | undefined = undefined,
    ) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._isMe = isMe;
        this._status = status;
    }

    public get id(): string {
        return this._id;
    }

    public get isMe(): boolean {
        return this._isMe;
    }

    public get name(): string {
        return this._name;
    }

    public get status(): Presence | undefined {
        return this._status;
    }

    public get username(): string {
        return this._username;
    }

    public static fromFullUser(id: string,
                               username: string,
                               name: string,
                               isMe: boolean,
                               status: string | Presence,
    ): User {
        return new this(id, username, name, isMe, status as Presence);
    }

    public static fromPartialUser(id: string, username: string, name: string | undefined, isMe: boolean): User {
        if (name === undefined) {
            return new this(id, username, username, isMe);
        } else {
            return new this(id, username, name, isMe);
        }
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            isMe: this.isMe,
            name: this.name,
            status: this.status,
            username: this.username,
        };
    }
}

export {
    User,
};
