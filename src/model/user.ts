/**
 * Statut de connexion
 */
enum UserStatus {
    AWAY = "away",
    OFFLINE = "offline",
    ONLINE = "online",
    UNKNOWN = "unknown",
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
     * Dernière activité
     * @private
     */
    private readonly _lastSeen: Date | undefined;

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
     * Nom d'utilisateur
     * @private
     */
    private readonly _username: string;

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

    public get lastSeen(): Date | undefined {
        return this._lastSeen;
    }

    public get name(): string {
        return this._name;
    }

    public get status(): UserStatus | undefined {
        return this._status;
    }

    public get username(): string {
        return this._username;
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
    public toJSON(): object {
        return {
            id: this.id,
            lastSeen: this.lastSeen,
            name: this.name,
            status: this.status,
            username: this.username,
        }
    }
}

export {User, UserStatus};
