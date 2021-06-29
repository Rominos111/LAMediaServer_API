import {JWT} from "helper/JWT";
import {RocketChat} from "helper/rocketChat";
import WebSocket from "ws";

enum RocketChatWebSocketState {
    /**
     * Socket fermée
     */
    CLOSED,

    /**
     * État initial, non initialisé
     */
    NONE,

    /**
     * État initialisé
     */
    INIT,

    /**
     * Socket ouverte
     */
    OPEN,

    /**
     * Socket reliée à RocketChat
     */
    LINKED,

    /**
     * Socket connectée via login
     */
    CONNECTED,

    /**
     * Socket abonnée à un flux RocketChat
     */
    SUBSCRIBED,
}

// type RocketChatWebSocketCallbackData = Record<string, unknown> & { currentUserId: string | null };
// TODO: Typage
type RocketChatWebSocketCallbackData = Record<string, unknown>;

type RocketChatWebSocketCallback = (data: RocketChatWebSocketCallbackData) => void;

class RocketChatWebSocket {
    /**
     * Callback de réponse
     * @private
     */
    private _responseCallback: RocketChatWebSocketCallback;

    /**
     * Socket RocketChat
     * @private
     */
    private _rocketChatSocket: WebSocket | null;

    /**
     * État courant
     * @private
     */
    private _state: RocketChatWebSocketState;

    /**
     * Nom de la requête de souscription
     * @private
     */
    private _subscribeRequestName: string;

    /**
     * Nom des paramètres de souscription
     * @private
     */
    private _subscribeRequestParams: (string | boolean)[];

    /**
     * Token
     * @private
     */
    private _token: string;

    /**
     * ID unique de la socket RocketChat
     * @private
     */
    private readonly _uid: string;

    private constructor() {
        this._responseCallback = () => {
        };
        this._rocketChatSocket = null;
        this._state = RocketChatWebSocketState.NONE;
        this._subscribeRequestName = "";
        this._subscribeRequestParams = [];
        this._token = "";
        this._uid = (Math.floor(Math.random() * Math.pow(2, 32))).toString();
    }

    public static getSocket(): RocketChatWebSocket {
        return new this();
    }

    public withToken(token: string | undefined): RocketChatWebSocket {
        let tokenSanitized: string = "";
        if (token !== undefined) {
            tokenSanitized = token;
        }
        this._token = tokenSanitized;
        return this;
    }

    public subscribedTo(name: string, params: (string | boolean)[]): RocketChatWebSocket {
        this._subscribeRequestName = name;
        this._subscribeRequestParams = params;
        return this;
    }

    public onResponse(responseCallback: RocketChatWebSocketCallback): RocketChatWebSocket {
        this._responseCallback = responseCallback;
        return this;
    }

    public open(): void {
        this._rocketChatSocket = new WebSocket(RocketChat.getWebSocketEndpoint());
        this._state = RocketChatWebSocketState.INIT;
        const rcws = this._rocketChatSocket;

        const jwt = JWT.decodeToken(this._token);
        let authToken = "";

        if (jwt === null) {
            console.debug("Wrong JWT");
        } else {
            authToken = jwt.data.authToken;
        }

        this._rocketChatSocket.addEventListener("message", (evt) => {
            let message: Record<string, unknown>;
            try {
                message = JSON.parse(evt.data);
            } catch (e) {
                console.warn("RC message is not an object:", evt.data);
                return;
            }

            if (message.msg === "ping") {
                rcws.send(JSON.stringify({
                    msg: "pong",
                }));
            } else {
                if (this._state === RocketChatWebSocketState.OPEN && message.server_id !== undefined) {
                    this._state = RocketChatWebSocketState.LINKED;
                } else if (this._state === RocketChatWebSocketState.LINKED && message.msg === "connected") {
                    this._state = RocketChatWebSocketState.CONNECTED;
                } else {
                    if (this._state === RocketChatWebSocketState.SUBSCRIBED) {
                        const messageWithUserId: RocketChatWebSocketCallbackData = message;
                        messageWithUserId.currentUserId = null;
                        if (jwt !== null) {
                            messageWithUserId.currentUserId = jwt.data.userId;
                        }
                        this._responseCallback(messageWithUserId);
                    } else if (message.msg === "ready") {
                        this._state = RocketChatWebSocketState.SUBSCRIBED;
                    }
                }
            }
        });

        this._rocketChatSocket.addEventListener("open", () => {
            this._state = RocketChatWebSocketState.OPEN;

            const connectRequest = {
                msg: "connect",
                version: "1",
                support: ["1", "pre2", "pre1"],
            };
            rcws.send(JSON.stringify(connectRequest));

            const loginRequest = {
                msg: "method",
                method: "login",
                id: this._uid,
                params: [{
                    resume: authToken,
                }],
            };
            rcws.send(JSON.stringify(loginRequest));

            const subscribeRequest = {
                msg: "sub",
                id: this._uid,
                name: this._subscribeRequestName,
                params: this._subscribeRequestParams,
            };

            rcws.send(JSON.stringify(subscribeRequest));
        });

        this._rocketChatSocket.addEventListener("close", () => {
            console.debug("RocketChat WebSocket closed");
        });

        this._rocketChatSocket.addEventListener("error", (err) => {
            if (err.type === "error" && err.target.readyState === WebSocket.CLOSING) {
                console.debug(err.message);
            } else {
                console.warn("error RC:", err);
            }
        });
    }

    public send(msg: string): void {
        if (this._rocketChatSocket !== null && this._state >= RocketChatWebSocketState.CONNECTED) {
            this._rocketChatSocket.send(msg);
        }
    }

    public close(): void {
        if (this._rocketChatSocket !== null) {
            if (this._state === RocketChatWebSocketState.SUBSCRIBED) {
                const unsubscribeRequest = {
                    msg: "unsub",
                    id: this._uid,
                };

                this._rocketChatSocket.send(JSON.stringify(unsubscribeRequest));
            }

            if (this._state !== RocketChatWebSocketState.CLOSED) {
                this._rocketChatSocket.close();
            }

            this._state = RocketChatWebSocketState.CLOSED;
        }
    }
}

export {RocketChatWebSocket};
