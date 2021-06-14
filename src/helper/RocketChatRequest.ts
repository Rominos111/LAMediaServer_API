import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {Request, Response} from "express";
import {APIResponse} from "helper/APIResponse";
import {RocketChat, RocketChatAuthentication} from "helper/rocketChat";

/**
 * Méthodes de requête
 */
enum RequestMethod {
    /**
     * Supprime
     */
    DELETE = "DELETE",

    /**
     * Récupération, listing. Cacheable
     */
    GET = "GET",

    /**
     * Update, remplace partiellement
     */
    PATCH = "PATCH",

    /**
     * Crée
     */
    POST = "POST",

    /**
     * Update, remplace complètement
     */
    PUT = "PUT",
}

/**
 * Requête à l'API de Rocket.chat
 */
class RocketChatRequest {
    /**
     * Requête
     * @param HTTPMethod Méthode HTTP, comme GET ou POST
     * @param route Route / endpoint
     * @param authReq Authentification requise ou non
     * @param res Réponse express
     * @param payload Payload fourni
     * @param onSuccess Fonction appelée en cas de succès HTTP (2XX)
     * @param onFailure Fonction appelée en cas d'échec HTTP
     */
    public static request(HTTPMethod: RequestMethod | string,
                          route: string,
                          authReq: Request | null = null,
                          res: Response,
                          payload: object | null = null,
                          onSuccess: ((r: AxiosResponse, data: any) => APIResponse) | null = null,
                          onFailure: ((r: AxiosResponse, data: any) => APIResponse) | null = null,
    ): void {
        if (payload === null) {
            payload = {};
        }

        let accessRoute = route;
        if (<RequestMethod>HTTPMethod === RequestMethod.GET) {
            // Cas spécial pour les requêtes GET, il faut les transformer en "/route?a=x&b=y"
            accessRoute = this._setGetPayload(route, payload);
        }

        // Headers envoyés à Rocket.chat
        let headers: AxiosRequestConfig = {
            "headers": {
                "Content-Type": "application/json",
            }
        };

        let tokenAllowed = true;
        if (authReq !== null) {
            const auth = this._getAuthenticationData(<Request>authReq, <RequestMethod>HTTPMethod);

            if (auth === null) {
                tokenAllowed = false;
            } else {
                // Headers d'authentification
                headers.headers["X-User-Id"] = auth.userId;
                headers.headers["X-Auth-Token"] = auth.authToken;
            }
        }

        if (tokenAllowed) {
            this._continueRequest(<RequestMethod>HTTPMethod, accessRoute, headers, res, payload, onSuccess, onFailure);
        } else {
            // Token invalide ou absent
            APIResponse.fromFailure("Invalid token", 401).send(res);
        }
    }

    /**
     * Récupère la méthode Axios associée au type de requête associé
     * @param method Méthode, comme GET ou POST
     * @private
     */
    private static _getMethodFunction(method: RequestMethod): { requestFunction: Function, usePayload: boolean } {
        switch (method) {
            case RequestMethod.GET:
                return {requestFunction: axios.get, usePayload: false};

            case RequestMethod.PUT:
                return {requestFunction: axios.put, usePayload: true};

            case RequestMethod.PATCH:
                return {requestFunction: axios.patch, usePayload: true};

            case RequestMethod.POST:
                return {requestFunction: axios.post, usePayload: true};

            case RequestMethod.DELETE:
                return {requestFunction: axios.delete, usePayload: false};

            default:
                throw new Error("No such HTTP method");
        }
    }

    private static _continueRequest(HTTPMethod: RequestMethod,
                                    route: string,
                                    headers: AxiosRequestConfig,
                                    res: Response,
                                    payload: object,
                                    onSuccess: ((r: AxiosResponse, data: any) => APIResponse) | null,
                                    onFailure: ((r: AxiosResponse, data: any) => APIResponse) | null,
    ): void {
        const {requestFunction, usePayload} = this._getMethodFunction(HTTPMethod);

        if (onSuccess === null) {
            // Fonction de succès par défaut
            onSuccess = (r, data) => {
                console.debug(data);
                return APIResponse.fromSuccess(null, r.status);
            }
        }

        if (onFailure === null) {
            // Fonction d'échec par défaut
            onFailure = (r, data) => {
                console.debug(data);
                return APIResponse.fromFailure(r.statusText, r.status);
            }
        }

        let promise: Promise<AxiosResponse>;
        if (usePayload) {
            // Méthodes utilisant un payload, comme POST
            promise = requestFunction(RocketChat.getAPIUrl(route), payload, headers);
        } else {
            // Méthodes n'utilisant pas de payload, comme GET
            promise = requestFunction(RocketChat.getAPIUrl(route), headers);
        }

        promise.then((r) => {
            if (Math.floor(r.status / 100) === 2) {
                // Réponse valide

                if (r.data.success !== true && r.data.success !== undefined) {
                    console.log("`r.data.success` is not true. Value:", r.data.success);
                }

                (<Function>onSuccess)(r, r.data).send(res);
            } else {
                // Réponse invalide, erreur
                (<Function>onFailure)(r, r.data).send(res);
            }
        }).catch((err) => {
            if (err.code && err.code === "ECONNREFUSED") {
                // Rocket.chat n'est pas lancé
                console.error("Connection refused with Rocket.chat");
                APIResponse.fromFailure("Connection refused", 500).send(res);
            } else if (err.response) {
                (<Function>onFailure)(err.response, err.response.data).send(res);
            } else {
                // Erreur inconnue
                console.debug(err);
                APIResponse.fromFailure("Unknown error", 500).send(res);
            }
        });
    }

    private static _getAuthenticationData(req: Request, _method: RequestMethod): RocketChatAuthentication | null {
        let token: string | null = null;

        if (req.body._token !== undefined) {
            token = req.body._token;
        } else if (req.headers["authorization"] !== undefined) {
            token = req.headers["authorization"]?.split(' ')[1];
        }

        if (token === null) {
            return null;
        } else {
            const auth = RocketChatAuthentication.fromToken(token);
            if (auth === null) {
                return null;
            } else {
                return auth;
            }
        }
    }

    /**
     * Configure le payload des requêtes GET
     * @param route Route de base
     * @param payload Payload
     * @private
     */
    private static _setGetPayload(route: string, payload: object): string {
        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return route;
        } else {
            let newRoute = route + "?";

            for (const key of keys) {
                newRoute += `${encodeURIComponent(key)}=${encodeURIComponent(payload[key])}&`;
            }

            return newRoute.slice(0, -1);
        }
    }
}

export {RocketChatRequest, RequestMethod}
