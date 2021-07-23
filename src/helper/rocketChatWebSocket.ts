/**
 * Requête à l'API WebSocket de Rocket.chat
 */

import {Request} from "express";
import {APIRErrorType} from "helper/APIResponse";
import {
    JWT,
    Token,
} from "helper/JWT";
import {RocketChat} from "helper/rocketChat";
import {Serializable} from "helper/serializable";
import {randomUID} from "helper/utils";
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
}

/**
 * Messages Rocket.chat possibles
 */
enum RocketChatWebSocketMessage {
    ADDED = "added",
    CHANGED = "changed",
    CONNECTED = "connected",
    ERROR = "error",
    INSERTED = "inserted",
    NOSUB = "nosub",
    PING = "ping",
    READY = "ready",
    REMOVED = "removed",
    RESULT = "result",
    UPDATED = "updated",
}

enum WebSocketServerEvent {
    CHANNEL_CREATED = "channelCreated",
    CHANNEL_DELETED = "channelDeleted",
    CHANNEL_UPDATED = "channelUpdated",
    CHANNEL_USER_LIST = "channelUserList",
    ERROR = "error",
    MESSAGE_CREATED = "messageCreated",
    MESSAGE_DELETED = "messageDeleted",
    MESSAGE_EDITED = "messageEdited",
    MODULE_CREATED = "moduleCreated",
    MODULE_DELETED = "moduleDeleted",
    MODULE_LIST = "moduleList",
    MODULE_UPDATED = "moduleUpdated",
    PRESENCE_UPDATED = "presenceUpdated",
    ROLE_LIST = "roleList",
    USER_UPDATED = "userUpdated",
}

enum WebSocketClientEvent {
    ERROR = "error",
    LIST_CHANNELS = "listChannels",
    LIST_MODULES = "listModules",
    LIST_ROLES = "listRoles",
    SEND_MESSAGE = "sendMessage",
}

/**
 * Data dans les callback
 */
interface RocketChatWebSocketCallbackData extends Record<string, unknown> {
    collection: string,
    currentUserId: string | null,
    fields: {
        args: unknown[],
        eventName: string,
    },
    id: string,
    msg: RocketChatWebSocketMessage,
    result: Record<string, unknown>,
}

/**
 * Data transmise
 */
type TransmitData = Record<string, unknown> | Serializable;

/**
 * Réponse serveur
 */
type ServerResponseCallback = (
    transmit: (data: TransmitData, evt: WebSocketServerEvent) => void,
    content: unknown,
    currentUserId: string | null,
    data: RocketChatWebSocketCallbackData,
) => void;

/**
 * Requête client
 */
type ClientCallCallback = (
    data: Record<string, unknown>,
    transmit: (data: TransmitData, evt: WebSocketClientEvent) => void,
) => void;

type SubscriptionParams = string | boolean | Record<string, string | boolean | unknown[]>;

interface ClientCallObject extends Record<string, unknown> {
    method: string,
}

/**
 * Requête à l'API WebSocket de Rocket.chat
 */
class RocketChatWebSocket {
    /**
     * Socket client
     * @private
     */
    private readonly _clientSocket: WebSocket;

    /**
     * Buffer des requêtes, pour la période où la socket Rocket.chat n'est pas encore ouverte mais celle client si
     * @private
     */
    private _requestBuffer: string[];

    /**
     * Socket RocketChat
     * @private
     */
    private readonly _rocketChatSocket: WebSocket;

    /**
     * État courant
     * @private
     */
    private _state: RocketChatWebSocketState;

    /**
     * Token
     * @private
     */
    private readonly _token: string | null;

    private _clientResultCallbacks: {
        [id: string]: {
            event: WebSocketClientEvent,
            callback: ClientCallCallback,
        }
    } = {};

    private _serverResponseCallbacks: { [sub: string]: ServerResponseCallback[] } = {};

    private constructor(token: string | null, ws: WebSocket) {
        this._clientSocket = ws;
        this._requestBuffer = [];
        this._rocketChatSocket = new WebSocket(RocketChat.getWebSocketEndpoint());
        this._state = RocketChatWebSocketState.NONE;
        this._token = token;
    }

    /**
     * Récupère une socket
     */
    public static getSocket(req: Request | null, ws: WebSocket): RocketChatWebSocket {
        return new this(req?.query._token ? req.query._token as string : null, ws);
    }

    public addClientCall(event: WebSocketClientEvent,
                         clientCallCallback: (
                             transmit: (data: TransmitData, evt: WebSocketClientEvent) => void,
                         ) => string | null,
                         clientResultCallback: (
                             data: Record<string, unknown>,
                             transmit: (data: TransmitData, evt: WebSocketClientEvent) => void,
                         ) => void = () => void null,
    ): RocketChatWebSocket {
        const id = clientCallCallback((obj, evt) => this._transmitData(obj, evt));
        if (id !== null) {
            this._clientResultCallbacks[id] = {
                event,
                callback: ((data, transmit) => {
                    clientResultCallback(data, transmit);
                }),
            };
        }
        return this;
    }

    /**
     * Ouvre la socket
     */
    public async open(): Promise<void> {
        await new Promise<void>((resolve: () => void) => {
            this._state = RocketChatWebSocketState.INIT;

            const jwt = this._token ? JWT.decodeToken(this._token) : null;

            if (jwt === null) {
                // FIXME: Déjà pris en compte non ?
                this._clientSocket.send({
                    error: {
                        type: APIRErrorType.AUTHENTICATION,
                    },
                    message: "Invalid token",
                });
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
        });

        console.info("WebSocket open");

        // Purge le cache des requêtes à envoyer à Rocket.chat
        this._sendRaw(null);
    }

    /**
     * Envoie un message à la WebSocket Rocket.chat
     * @param method Méthode
     * @param data Message à envoyer
     */
    public callMethod(method: string, data: Record<string, unknown>): string {
        const id = randomUID();
        this._sendRaw(JSON.stringify({
            msg: "method",
            method,
            id,
            params: [
                data,
            ],
        }));
        return id;
    }

    /**
     * Ferme la WebSocket API <-> Rocket.chat
     */
    public close(): void {
        console.info("WebSocket closed");

        if (this._rocketChatSocket !== null && this._clientSocket !== null) {
            if (this._state !== RocketChatWebSocketState.CLOSED) {
                this._rocketChatSocket.close();
                this._clientSocket.close();
            }

            this._state = RocketChatWebSocketState.CLOSED;
        }
    }

    public addSubscription(name: string, params: SubscriptionParams[], onResponse: ServerResponseCallback): RocketChatWebSocket {
        const uid = randomUID();

        this._rocketChatSocket.send(JSON.stringify({
            msg: "sub",
            id: uid,
            name,
            params,
        }));

        if (this._serverResponseCallbacks[name] === void null) {
            this._serverResponseCallbacks[name] = [];
        }

        this._serverResponseCallbacks[name].push(onResponse);

        return this;
    }

    public transmitError(errorType: string, message: string): void {
        this._clientSocket.send(JSON.stringify({
            error: {
                type: errorType,
            },
            message,
            event: WebSocketServerEvent.ERROR,
            payload: {},
        }));
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

    /**
     * Retour d'un message issu d'un abonnement
     * @param message Message reçu
     * @private
     */
    private _processMessageSubscription(message: RocketChatWebSocketCallbackData): void {
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
            if (this._clientResultCallbacks.hasOwnProperty(message.id)) {
                this._clientResultCallbacks[message.id].callback(message.result, (data, evt) => this._transmitData(data, evt));
            }
        } else {
            for (const methodName of Object.keys(this._serverResponseCallbacks)) {
                if (message.fields === undefined) {
                    console.log(message, message.fields);
                }
                if (methodName === message.fields.eventName || methodName === message.collection) {
                    for (const content of message.fields.args) {
                        if (typeof content === "object") {
                            for (const callback of this._serverResponseCallbacks[methodName]) {
                                callback(
                                    (obj, evt) => this._transmitData(obj, evt),
                                    content,
                                    message.currentUserId,
                                    message,
                                );
                            }
                        }
                    }
                }
            }
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
            } else if (this._state === RocketChatWebSocketState.LINKED
                && message.msg === RocketChatWebSocketMessage.CONNECTED) {
                // Socket reliée à Rocket.chat et connectée
                this._state = RocketChatWebSocketState.CONNECTED;
                resolveOpenSocket();
            } else {
                if (![
                    RocketChatWebSocketMessage.READY,
                    RocketChatWebSocketMessage.UPDATED,
                    RocketChatWebSocketMessage.NOSUB,
                ].includes(message.msg)) {
                    this._processMessageSubscription(message);
                }
            }
        }
    }

    private _transmitData(data: TransmitData, evt: WebSocketServerEvent | WebSocketClientEvent): void {
        this._clientSocket.send(JSON.stringify({
            error: {
                type: "?",
            },
            message: "?",
            event: evt,
            payload: data,
        }));
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
            id: randomUID(),
            params: [{
                resume: token.data.authToken,
            }],
        };
        rcws.send(JSON.stringify(loginRequest));
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

export {
    RocketChatWebSocket,
    RocketChatWebSocketMessage,
    WebSocketClientEvent,
    WebSocketServerEvent,
};
export type {TransmitData};
