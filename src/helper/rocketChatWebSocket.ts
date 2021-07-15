/**
 * Requête à l'API WebSocket de Rocket.chat
 */

import {Request} from "express";
import {
    JWT,
    Token,
} from "helper/JWT";
import {RocketChat} from "helper/rocketChat";
import {randomUID} from "helper/utils";
import {Validation} from "helper/validation";
import {ObjectSchema} from "joi";
import WebSocket from "ws";

/**
 * État actuel de la WebSocket
 */
enum RocketChatWebSocketState {
    /**
     * Socket fermée
     */
    CLOSED = 0,

    /**
     * État initial, non initialisé
     */
    NONE = 1,

    /**
     * État initialisé
     */
    INIT = 2,

    /**
     * Socket ouverte
     */
    OPEN = 3,

    /**
     * Socket reliée à RocketChat
     */
    LINKED = 4,

    /**
     * Socket connectée via login
     */
    CONNECTED = 5,

    /**
     * Socket abonnée à un flux RocketChat
     */
    SUBSCRIBED = 6,
}

enum RocketChatWebSocketMessage {
    ADDED = "added",
    CHANGED = "changed",
    CONNECTED = "connected",
    ERROR = "error",
    PING = "ping",
    READY = "ready",
    RESULT = "result",
    UPDATED = "updated",
}

type RocketChatWebSocketCallbackData = Record<string, unknown> & {
    currentUserId: string | null,
    fields: {
        args: unknown[],
    },
    msg: RocketChatWebSocketMessage,
};

type TransmitData = Record<string, unknown> | Record<string, unknown>[] | unknown[];

type ServerResponseCallback = (
    transmit: (data: TransmitData) => void,
    content: unknown,
    currentUserId: string | null,
    data: RocketChatWebSocketCallbackData,
) => void;

type ClientCallCallback = (
    data: Record<string, unknown>,
) => void;

/**
 * Requête à l'API WebSocket de Rocket.chat
 */
class RocketChatWebSocket {
    private _clientCallCallback: ClientCallCallback;

    private _clientSocket: WebSocket | null;

    private _requestBuffer: string[];

    /**
     * Socket RocketChat
     * @private
     */
    private _rocketChatSocket: WebSocket | null;

    /**
     * Callback de réponse
     * @private
     */
    private _serverResponseCallback: ServerResponseCallback;

    /**
     * État courant
     * @private
     */
    private _state: RocketChatWebSocketState;

    /**
     * Nom de la requête de souscription
     * @private
     */
    private _subscribeRequestName: string | null;

    /**
     * Nom des paramètres de souscription
     * @private
     */
    private _subscribeRequestParams: (string | boolean)[] | null;

    /**
     * Token
     * @private
     */
    private readonly _token: string | null;

    /**
     * ID unique de la socket RocketChat
     * @private
     */
    private readonly _uid: string;

    private _url: string;

    private constructor(token: string | null) {
        this._clientCallCallback = () => void null;
        this._clientSocket = null;
        this._requestBuffer = [];
        this._rocketChatSocket = null;
        this._serverResponseCallback = () => void null;
        this._state = RocketChatWebSocketState.NONE;
        this._subscribeRequestName = null;
        this._subscribeRequestParams = null;
        this._token = token;
        this._uid = randomUID();
        this._url = "(?)";
    }

    /**
     * Récupère une socket
     */
    public static getSocket(req: Request | null): RocketChatWebSocket {
        return new this(req?.query._token ? req.query._token as string : null);
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

    public onClientCall(schema: ObjectSchema | null, clientCallCallback: ClientCallCallback): RocketChatWebSocket {
        this._clientCallCallback = (data) => {
            const validationSchema: ObjectSchema = (schema === null ? Validation.object({}) : schema);
            const valid = validationSchema.validate(data);
            if (valid.error) {
                console.debug("WebSocket client call validation error:", valid.error.message);
            } else {
                return clientCallCallback(data);
            }
        };
        return this;
    }

    /**
     * Callback de réponse
     * @param responseCallback
     */
    public onServerResponse(responseCallback: ServerResponseCallback): RocketChatWebSocket {
        this._serverResponseCallback = responseCallback;
        return this;
    }

    /**
     * Ouvre la socket
     */
    public async open(clientSocket: WebSocket, req: Request): Promise<void> {
        this._url = req.baseUrl;
        console.info(`WS ${this._url} WebSocket open`);

        await new Promise<void>((resolve: () => void) => {
            this._rocketChatSocket = new WebSocket(RocketChat.getWebSocketEndpoint());
            this._clientSocket = clientSocket;
            this._state = RocketChatWebSocketState.INIT;

            const jwt = this._token ? JWT.decodeToken(this._token) : null;

            if (jwt === null) {
                console.debug("Wrong JWT");
                this._rocketChatSocket.close();
                this._clientSocket.close();
                return;
            }

            this._rocketChatSocket.on("close", () => void null);

            this._rocketChatSocket.on("error", (err) => this._onWebSocketError(err));

            this._rocketChatSocket.on("message", (evt) => {
                this._onWebSocketMessage(evt as string, this._rocketChatSocket as WebSocket, jwt, resolve);
            });

            this._rocketChatSocket.on("open", () => this._onWebSocketOpen(this._rocketChatSocket as WebSocket, jwt));


            this._clientSocket.on("close", () => this.close());

            this._clientSocket.on("error", (err) => this._onWebSocketError(err));

            this._clientSocket.on("message", (msg: WebSocket.Data) => {
                let obj = null;
                try {
                    obj = JSON.parse(msg as string);
                } catch (err) {
                    console.debug("Wrong WebSocket client call type", err.message);
                }

                if (obj !== null) {
                    this._clientCallCallback(obj);
                }
            });
        });

        this._sendRaw(null);
    }

    /**
     * Envoie un message à la WebSocket Rocket.chat
     * @param method Méthode
     * @param data Message à envoyer
     */
    public callMethod(method: string, data: Record<string, unknown>): void {
        this._sendRaw(JSON.stringify({
            msg: "method",
            method,
            id: this._uid,
            params: [
                data,
            ],
        }));
    }

    /**
     * Ferme la WebSocket API <-> Rocket.chat
     */
    public close(): void {
        console.info(`WS ${this._url} WebSocket closed`);

        if (this._rocketChatSocket !== null && this._clientSocket !== null) {
            if (this._state === RocketChatWebSocketState.SUBSCRIBED) {
                const unsubscribeRequest = {
                    msg: "unsub",
                    id: this._uid,
                };

                this._rocketChatSocket.send(JSON.stringify(unsubscribeRequest));
            }

            if (this._state !== RocketChatWebSocketState.CLOSED) {
                this._rocketChatSocket.close();
                this._clientSocket.close();
            }

            this._state = RocketChatWebSocketState.CLOSED;
        }
    }

    /**
     * Envoie un message à la WebSocket Rocket.chat
     * @param msg Message
     */
    private _sendRaw(msg: string | null): void {
        if (this._rocketChatSocket !== null && this._state >= RocketChatWebSocketState.CONNECTED) {
            while (this._requestBuffer.length > 0) {
                this._rocketChatSocket.send(this._requestBuffer.shift());
            }

            if (msg !== null) {
                this._rocketChatSocket.send(msg);
            }
        } else if (msg !== null) {
            this._requestBuffer.push(msg);
        }
    }

    private _processMessageSubscription(message: RocketChatWebSocketCallbackData) {
        if (!message.hasOwnProperty("msg") || message.msg === RocketChatWebSocketMessage.ERROR) {
            console.warn("WebSocket client error:", message.reason);
        } else if (message.msg === RocketChatWebSocketMessage.CHANGED && message.collection === this._subscribeRequestName) {
            if (message.fields.args.length !== 1) {
                console.debug("Length !== 1:", message);
            }

            for (const content of message.fields.args) {
                this._serverResponseCallback(
                    (obj) => this._transmitData(obj),
                    content,
                    message.currentUserId,
                    message,
                );
            }
        }
    }

    private _processMessageMethodCall(message: RocketChatWebSocketCallbackData) {
        if (!message.hasOwnProperty("msg") || message.msg === RocketChatWebSocketMessage.ERROR) {
            console.warn("WebSocket client error:", message.reason);
        } else if (message.hasOwnProperty("result")
            && (message.result as Record<string, unknown>).hasOwnProperty("token")
            && (message.result as Record<string, unknown>).hasOwnProperty("tokenExpires")
            && (message.result as Record<string, unknown>).hasOwnProperty("type")
            && (message.result as Record<string, unknown>).type === "resume"
        ) {
            // Message de confirmation de connexion, inutile dans notre cas
        } else if (message.msg === RocketChatWebSocketMessage.RESULT) {
            this._serverResponseCallback(
                (obj) => this._transmitData(obj),
                message.result,
                message.currentUserId,
                message,
            );
        }
    }

    /**
     * Callback lors d'un message de la WebSocket Rocket.chat
     * @param data Data
     * @param rcws WebSocket Rocket.chat
     * @param jwt Token
     * @param resolveOpenSocket Permet d'arrêter la promise pour signaler que la socket est ouverte
     * @private
     */
    private _onWebSocketMessage(data: string, rcws: WebSocket, jwt: Token | null, resolveOpenSocket: () => void): void {
        let message: RocketChatWebSocketCallbackData;
        try {
            message = JSON.parse(data);
        } catch (err) {
            console.warn("RC message is not an object:", data);
            return;
        }

        message.currentUserId = null;
        if (jwt !== null) {
            message.currentUserId = jwt.data.userId;
        }

        if (message.msg === RocketChatWebSocketMessage.PING) {
            // Keep-alive
            rcws.send(JSON.stringify({
                msg: "pong",
            }));
        } else {
            if (this._state === RocketChatWebSocketState.OPEN && message.hasOwnProperty("server_id")) {
                // Socket ouverte et reliée à Rocket.chat
                this._state = RocketChatWebSocketState.LINKED;
            } else if (this._state === RocketChatWebSocketState.LINKED && message.msg === RocketChatWebSocketMessage.CONNECTED) {
                // Socket reliée à Rocket.chat et connectée
                this._state = RocketChatWebSocketState.CONNECTED;
                resolveOpenSocket();
            } else {
                if (this._subscribeRequestName === null) {
                    if (this._state === RocketChatWebSocketState.CONNECTED) {
                        this._processMessageMethodCall(message);
                    }
                } else {
                    if (this._state !== RocketChatWebSocketState.SUBSCRIBED && message.msg === RocketChatWebSocketMessage.READY) {
                        // Socket venant de s'abonner
                        this._state = RocketChatWebSocketState.SUBSCRIBED;
                    } else if (this._state === RocketChatWebSocketState.SUBSCRIBED) {
                        // Socket abonnée, réception des message
                        this._processMessageSubscription(message);
                    } else {
                        // Garbage : messages non utilisés, informations de connexion, etc.
                    }
                }
            }
        }
    }

    private _transmitData(data: TransmitData) {
        if (this._clientSocket === null) {
            console.warn("Invalid state: null client socket");
        } else {
            this._clientSocket.send(JSON.stringify({
                error: {
                    type: "?",
                },
                message: "?",
                payload: data,
            }));
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

        if (this._subscribeRequestName !== null && this._subscribeRequestParams !== null) {
            // Souscription
            const subscribeRequest = {
                msg: "sub",
                id: this._uid,
                name: this._subscribeRequestName,
                params: this._subscribeRequestParams,
            };

            rcws.send(JSON.stringify(subscribeRequest));
        }
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
export type {TransmitData};
