import {JWT} from "helper/JWT";

/**
 * Authentification Rocket.chat
 */
class RocketChatAuthentication {
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
    public static fromToken(token: string): RocketChatAuthentication | null {
        let auth = JWT.decodeToken(token);
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
    public static fromValues(userId: string, authToken: string): RocketChatAuthentication {
        return new this(userId, authToken);
    }
}

class RocketChat {
    /**
     * Récupère l'URL Rocket.chat à partir d'un endpoint
     * @param endpoint Destination de l'API, comme "/login"
     */
    static getAPIUrl(endpoint = ""): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        return `${process.env.ROCKETCHAT_PROTOCOL}://${process.env.ROCKETCHAT_ADDRESS}:${process.env.ROCKETCHAT_PORT}/api/v1/${endpoint}`;
    }
}

export {RocketChat, RocketChatAuthentication};
