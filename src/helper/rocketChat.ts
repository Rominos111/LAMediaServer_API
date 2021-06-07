import JWT from "helper/JWT";

class RocketChatAuthentication {
    private readonly _userId: string;
    private readonly _authToken: string;

    private constructor(userId: string, authToken: string) {
        this._userId = userId;
        this._authToken = authToken;
    }

    public static fromToken(token: string): RocketChatAuthentication|null {
        let auth = JWT.decodeToken(token);
        if (auth === null) {
            return null;
        } else {
            return new this(auth.userId, auth.authToken);
        }
    }

    public static fromValues(userId: string, authToken: string): RocketChatAuthentication {
        return new this(userId, authToken);
    }

    get userId() {
        return this._userId;
    }

    get authToken() {
        return this._authToken;
    }
}

class RocketChat {
    static getAPIUrl(endpoint: string = ""): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        return `http://${process.env.ROCKETCHAT_ADDRESS}:${process.env.ROCKETCHAT_PORT}/api/v1/${endpoint}`;
    }
}

export {RocketChat, RocketChatAuthentication};
export default RocketChat;
