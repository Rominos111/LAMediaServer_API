import {JWT} from "helper/JWT";
import {RocketChat} from "helper/rocketChat";
import {RealTimeAPI} from "rocket.chat.realtime.api.rxjs";

class RocketChatWebSocket {
    private readonly _token: string;
    private _responseCallback;

    private constructor(token: string) {
        this._token = token;
        this._responseCallback = () => {
        };
    }

    public static getSocket(token: string | undefined): RocketChatWebSocket {
        let tokenSanitized: string = "";
        if (token !== undefined) {
            tokenSanitized = token;
        }
        return new this(tokenSanitized);
    }

    public onResponse(responseCallback) {
        this._responseCallback = responseCallback;
        return this;
    }

    public open(): void {
        const realTimeAPI = new RealTimeAPI(RocketChat.getWebSocketEndpoint());
        realTimeAPI.keepAlive().subscribe();

        const jwt = JWT.decodeToken(this._token);
        let authToken = "";

        if (jwt === null) {
            console.debug("Wrong JWT");
        } else {
            authToken = jwt.data.authToken;
        }

        const auth = realTimeAPI.loginWithAuthToken(authToken);
        const subscription = auth.subscribe(
            (data) => {
                console.log(data)
            },
            (err) => {
                console.log(err)
            },
            () => {
                console.log("completed")
            },
        );
    }
}

export {RocketChatWebSocket};
