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
    private readonly _status: UserStatus;

    /**
     * Dernière activité
     * @private
     */
    private readonly _lastSeen: Date;

    public constructor(id: string,
                       username: string,
                       name: string,
                       status: string | UserStatus,
                       lastSeen: string | Date) {
        this._id = id;
        this._username = username;
        this._name = name;
        this._status = <UserStatus>status;
        this._lastSeen = new Date(lastSeen);
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

    public get status(): UserStatus {
        return this._status;
    }

    public get lastSeen(): Date {
        return this._lastSeen;
    }

    /**
     * Permet l'encodage en JSON
     */
    public toJSON() {
        return {
            id: this.id,
            username: this.username,
            name: this.name,
            status: this.status,
            lastSeen: this.lastSeen
        }
    }
}

export {User, UserStatus};
export default User;
