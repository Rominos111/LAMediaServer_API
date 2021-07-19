/**
 * Utilisateur
 */
import {Serializable} from "helper/serializable";
import {Presence} from "model/presence";
import {Role} from "model/role";

interface RawPartialUser {
    _id: string,
    username: string,
    name?: string,
}

interface RawFullUser extends RawPartialUser {
    status: string | Presence,
    statusText?: string,
    type: string, // `user` ou `bot` ?
}

class User implements Serializable {
    /**
     * ID
     * @protected
     */
    protected readonly _id: string;

    /**
     * Utilisateur courant ou non
     * @protected
     */
    protected readonly _isMe: boolean;

    /**
     * Nom complet
     * @protected
     */
    protected readonly _name: string;

    protected readonly _roles: Role[] | null;

    /**
     * Statut
     * @protected
     */
    protected readonly _status: Presence;

    protected readonly _statusMessage: string | null;

    /**
     * Nom d'utilisateur
     * @protected
     */
    protected readonly _username: string;

    protected constructor(id: string,
                          username: string,
                          name: string,
                          isMe: boolean,
                          roles: Role[] | null,
                          status: Presence,
                          statusMessage: string | null,
    ) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._isMe = isMe;
        this._roles = roles;
        this._status = status;
        this._statusMessage = statusMessage;
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

    public get roles(): Role[] | null {
        return this._roles;
    }

    public get status(): Presence {
        return this._status;
    }

    public get statusMessage(): string | null {
        return this._statusMessage;
    }

    public get username(): string {
        return this._username;
    }

    public static fromFullUser(rawUser: RawFullUser, currentUserId: string, roles?: string[]): User {
        return new this(
            rawUser._id,
            rawUser.username,
            rawUser.name ? rawUser.name : rawUser.username,
            rawUser._id === currentUserId,
            roles ? Role.fromStringArray(roles) : null,
            rawUser.status as Presence,
            rawUser.statusText ? rawUser.statusText : null,
        );
    }

    public static fromPartialUser(rawUser: RawPartialUser, currentUserId: string): User {
        return new this(
            rawUser._id,
            rawUser.username,
            rawUser.name ? rawUser.name : rawUser.username,
            rawUser._id === currentUserId,
            null,
            Presence.UNKNOWN,
            null,
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
            roles: this.roles,
            status: this.status,
            statusMessage: this.statusMessage,
            username: this.username,
        };
    }
}

export {User};
export type {
    RawFullUser,
    RawPartialUser,
};
