/**
 * Utilisateur
 */
import {Presence} from "model/presence";

interface RawPartialUser {
    _id: string,
    username: string,
    name?: string,
}

interface RawFullUser extends RawPartialUser {
    status: string | Presence,
}

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
    private readonly _status: Presence;

    /**
     * Nom d'utilisateur
     * @private
     */
    private readonly _username: string;

    private constructor(id: string,
                        username: string,
                        name: string,
                        isMe: boolean,
                        status: Presence,
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

    public get status(): Presence {
        return this._status;
    }

    public get username(): string {
        return this._username;
    }

    public static fromFullUser(rawUser: RawFullUser, currentUserId: string): User {
        return new this(
            rawUser._id,
            rawUser.username,
            rawUser.name ? rawUser.name : rawUser.username,
            rawUser._id === currentUserId,
            rawUser.status as Presence,
        );
    }

    public static fromPartialUser(rawUser: RawPartialUser, currentUserId: string): User {
        return new this(
            rawUser._id,
            rawUser.username,
            rawUser.name ? rawUser.name : rawUser.username,
            rawUser._id === currentUserId,
            Presence.UNKNOWN,
        );
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

export {User};
export type {
    RawFullUser,
    RawPartialUser,
};
