/**
 * Statut de connexion
 */
enum UserStatus {
    UNKNOWN = "unknown",
    OFFLINE = "offline",
    ONLINE = "online",
    AWAY = "away",
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
    private readonly _status: UserStatus | undefined;

    /**
     * Dernière activité
     * @private
     */
    private readonly _lastSeen: Date | undefined;

    private constructor(id: string,
                        username: string,
                        name: string,
                        status: UserStatus | undefined = undefined,
                        lastSeen: Date | undefined = undefined) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._status = status;
        this._lastSeen = lastSeen;
    }

    public get id(): string {
        return this._id;
    }

    public get username(): string {
        return this._username;
    }

    public get name(): string {
        return this._name;
    }

    public get status(): UserStatus | undefined {
        return this._status;
    }

    public get lastSeen(): Date | undefined {
        return this._lastSeen;
    }

    public static fromFullUser(id: string,
                               username: string,
                               name: string,
                               status: string | UserStatus,
                               lastSeen: string | Date | undefined,
    ): User {
        if (lastSeen !== undefined) {
            lastSeen = new Date(lastSeen);
        }

        return new this(id, username, name, <UserStatus>status, lastSeen);
    }

    public static fromPartialUser(id: string, username: string, name: string | undefined): User {
        if (name === undefined) {
            return new this(id, username, username);
        } else {
            return new this(id, username, name);
        }
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
