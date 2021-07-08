/**
 * Requête à l'API WebSocket de Rocket.chat
 */

import {
    JWT,
    Token,
} from "helper/JWT";
import {RocketChat} from "helper/rocketChat";
import WebSocket from "ws";

/**
 * État actuel de la WebSocket
 */
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

type RocketChatWebSocketCallbackData = Record<string, unknown> & {
    fields: {
        args: unknown[],
    },
    currentUserId: string | null,
};

type RocketChatWebSocketCallback = (elts: unknown[],
                                    currentUserId: string | null,
                                    data: RocketChatWebSocketCallbackData) => void;

/**
 * Requête à l'API WebSocket de Rocket.chat
 */
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

    /**
     * Récupère une socket
     */
    public static getSocket(): RocketChatWebSocket {
        return new this();
    }

    /**
     * Set le token
     * @param token Token
     */
    public withToken(token: string): RocketChatWebSocket {
        this._token = token;
        return this;
    }

    /**
     * Set l'abonnement, i.e. le flux suivi (messages, etc)
     * @param name Nom du flux
     * @param params Paramètres
     */
    public subscribedTo(name: string, params: (string | boolean)[]): RocketChatWebSocket {
        this._subscribeRequestName = name;
        this._subscribeRequestParams = params;
        return this;
    }

    /**
     * Callback de réponse
     * @param responseCallback
     */
    public onResponse(responseCallback: RocketChatWebSocketCallback): RocketChatWebSocket {
        this._responseCallback = responseCallback;
        return this;
    }

    /**
     * Ouvre la socket
     */
    public open(ws: WebSocket): void {
        this._rocketChatSocket = new WebSocket(RocketChat.getWebSocketEndpoint());
        this._state = RocketChatWebSocketState.INIT;

        const jwt = JWT.decodeToken(this._token);

        if (jwt === null) {
            console.debug("Wrong JWT");
            this._rocketChatSocket.close();
            ws.close();
            return;
        }

        this._rocketChatSocket.on("message", (evt) => {
            this._onWebSocketMessage(evt as string, this._rocketChatSocket as WebSocket, jwt);
        });

        this._rocketChatSocket.on("open", () => {
            this._onWebSocketOpen(this._rocketChatSocket as WebSocket, jwt);
        });

        this._rocketChatSocket.on("close", () => {
            this._onWebSocketClose();
        });

        this._rocketChatSocket.on("error", (err) => {
            this._onWebSocketError(err);
        });

        ws.on("error", (err) => {
            console.warn("client WS error:", err.message);
        });

        ws.on("close", () => {
            this.close();
        });

        ws.on("message", (msg: WebSocket.Data) => {
            console.debug("Message envoyé à Rocket.chat:", msg);
            // rcws.send(msg.toString());
        });
    }

    /**
     * Envoie un message à la WebSocket Rocket.chat
     * @param msg Message
     */
    public send(msg: string): void {
        if (this._rocketChatSocket !== null && this._state >= RocketChatWebSocketState.CONNECTED) {
            this._rocketChatSocket.send(msg);
        }
    }

    /**
     * Ferme la WebSocket API <-> Rocket.chat
     */
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

    /**
     * Callback lors d'un message de la WebSocket Rocket.chat
     * @param data Data
     * @param rcws WebSocket Rocket.chat
     * @param jwt Token
     * @private
     */
    private _onWebSocketMessage(data: string, rcws: WebSocket, jwt: Token | null): void {
        let message: RocketChatWebSocketCallbackData;
        try {
            message = JSON.parse(data);
        } catch (e) {
            console.warn("RC message is not an object:", data);
            return;
        }

        if (message.msg === "ping") {
            // Keep-alive
            rcws.send(JSON.stringify({
                msg: "pong",
            }));
        } else {
            if (this._state === RocketChatWebSocketState.OPEN && message.hasOwnProperty("server_id")) {
                this._state = RocketChatWebSocketState.LINKED;
            } else if (this._state === RocketChatWebSocketState.LINKED && message.msg === "connected") {
                this._state = RocketChatWebSocketState.CONNECTED;
            } else if (this._state !== RocketChatWebSocketState.SUBSCRIBED && message.msg === "ready") {
                this._state = RocketChatWebSocketState.SUBSCRIBED;
            } else if (this._state === RocketChatWebSocketState.SUBSCRIBED) {
                const response: RocketChatWebSocketCallbackData = message;
                response.currentUserId = null;
                if (jwt !== null) {
                    response.currentUserId = jwt.data.userId;
                }

                if (!response.hasOwnProperty("msg") || response.msg === "error") {
                    console.warn("WebSocket client error:", response.reason);
                } else if (response.msg === "changed" && response.collection === this._subscribeRequestName) {
                    this._responseCallback(response.fields.args, response.currentUserId, response);
                } else if (response.msg === "updated") {
                    // FIXME: À quoi correspond ce message ?
                } else {
                    console.warn("Invalid WebSocket state:", response);
                }
            } else {
                // Garbage : messages non utilisés, informations de connexion, etc.
            }
        }
    }

    /**
     * Callback lors de l'ouverture de la WebSocket
     * @param rcws WebSocket Rocket.chat
     * @param token Token de l'API
     * @private
     */
    private _onWebSocketOpen(rcws: WebSocket, token: Token): void {
        this._state = RocketChatWebSocketState.OPEN;

        // Connexion WebSocket Rocket.chat
        const connectRequest = {
            msg: "connect",
            version: "1",
            support: ["1"],
        };
        rcws.send(JSON.stringify(connectRequest));

        // Login
        const loginRequest = {
            msg: "method",
            method: "login",
            id: this._uid,
            params: [{
                resume: token.data.authToken,
            }],
        };
        rcws.send(JSON.stringify(loginRequest));

        // Souscription
        const subscribeRequest = {
            msg: "sub",
            id: this._uid,
            name: this._subscribeRequestName,
            params: this._subscribeRequestParams,
        };

        rcws.send(JSON.stringify(subscribeRequest));
    }

    /**
     * Callback lors de la fermeture d'une WebSocket
     * @private
     */
    private _onWebSocketClose(): void {
        console.debug("RocketChat WebSocket closed");
    }

    /**
     * Callback lors d'une erreur dans la WebSocket
     * @param err Erreur
     * @private
     */
    private _onWebSocketError(err: Error): void {
        if (this._state === RocketChatWebSocketState.INIT && this._rocketChatSocket?.readyState === WebSocket.CLOSING) {
            // WebSocket fermée avant que la connexion soit établie, pas une erreur en soi
        } else {
            console.warn("error RC:", err, this._state, this._rocketChatSocket?.readyState);
        }
    }
}

export {RocketChatWebSocket};
