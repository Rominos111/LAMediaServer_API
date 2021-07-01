import {JWT} from "helper/JWT";

/**
 * Authentification Rocket.chat
 */
class Authentication {
    /**
     * Token d'authentification de l'utilisateur
     * @private
     */
    private readonly _authToken: string;

    /**
     * ID de l'utilisateur
     * @private
     */
    private readonly _userId: string;

    /**
     * Constructeur
     * @param userId ID de l'utilisateur
     * @param authToken Token d'authentification Rocket.chat
     * @private
     */
    private constructor(userId: string, authToken: string) {
        this._userId = userId;
        this._authToken = authToken;
    }

    /**
     * Token d'authentification Rocket.chat
     */
    public get authToken(): string {
        return this._authToken;
    }

    /**
     * ID de l'utilisateur
     */
    public get userId(): string {
        return this._userId;
    }

    /**
     * Depuis un token
     * @param token Token JWT
     */
    public static fromToken(token: string): Authentication | null {
        const auth = JWT.decodeToken(token);
        if (auth === null) {
            return null;
        } else {
            return new this(auth.data.userId, auth.data.authToken);
        }
    }

    /**
     * Depuis des valeurs directes
     * @param userId
     * @param authToken
     */
    public static fromValues(userId: string, authToken: string): Authentication {
        return new this(userId, authToken);
    }
}

export {Authentication};
