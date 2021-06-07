import JWT from "helper/JWT";

/**
 * Authentification Rocket.chat
 */
class RocketChatAuthentication {
    /**
     * ID de l'utilisateur
     * @private
     */
    private readonly _userId: string;

    /**
     * Token d'authentification de l'utilisateur
     * @private
     */
    private readonly _authToken: string;

    private constructor(userId: string, authToken: string) {
        this._userId = userId;
        this._authToken = authToken;
    }

    /**
     * Depuis un token
     * @param token Token JWT
     */
    public static fromToken(token: string): RocketChatAuthentication|null {
        let auth = JWT.decodeToken(token);
        if (auth === null) {
            return null;
        } else {
            return new this(auth.userId, auth.authToken);
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

    /**
     * ID de l'utilisateur
     */
    get userId() {
        return this._userId;
    }

    /**
     * Token d'authentification Rocket.chat
     */
    get authToken() {
        return this._authToken;
    }
}

class RocketChat {
    /**
     * Récupère l'URL Rocket.chat à partir d'un endpoint
     * @param endpoint Destination de l'API, comme "/login"
     */
    static getAPIUrl(endpoint: string = ""): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        return `http://${process.env.ROCKETCHAT_ADDRESS}:${process.env.ROCKETCHAT_PORT}/api/v1/${endpoint}`;
    }
}

export {RocketChat, RocketChatAuthentication};
export default RocketChat;
