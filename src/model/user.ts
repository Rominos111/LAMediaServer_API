/**
 * Statut de connexion
 */
enum UserStatus {
    UNKNOWN = "unknown",
    OFFLINE = "offline",
    ONLINE = "online",
}

/**
 * Utilisateur
 */
class User {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Nom d'utilisateur
     * @private
     */
    private readonly _username: string;

    /**
     * Nom complet
     * @private
     */
    private readonly _name: string;

    /**
     * Statut
     * @private
     */
    private readonly _status: UserStatus | null;

    /**
     * Dernière activité
     * @private
     */
    private readonly _lastSeen: Date | null;

    private constructor(id: string,
                        username: string,
                        name: string,
                        status: UserStatus | null = null,
                        lastSeen: Date | null = null) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._status = status;
        this._lastSeen = lastSeen;
    }

    public get id() {
        return this._id;
    }

    public get username() {
        return this._username;
    }

    public get name(): string {
        return this._name;
    }

    public get status(): UserStatus | null {
        return this._status;
    }

    public get lastSeen(): Date | null {
        return this._lastSeen;
    }

    public static fromFullUser(id: string,
                               username: string,
                               name: string,
                               status: string | UserStatus,
                               lastSeen: string | Date,
    ): User {
        return new this(id, username, name, <UserStatus>status, new Date(lastSeen));
    }

    public static fromPartialUser(id: string, username: string, name: string): User {
        return new this(id, username, name);
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON(): Object {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            status: this.status,
            lastSeen: this.lastSeen,
        }
    }
}

export {User, UserStatus};
export default User;
