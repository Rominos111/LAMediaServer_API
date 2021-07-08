/**
 * Requête à l'API REST de Rocket.chat
 */

import axios, {
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import {Response} from "express";
import {APIResponse} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {
    isValidStatusCode,
    RequestMethod,
} from "helper/requestMethod";
import {RocketChat} from "helper/rocketChat";

/**
 * Réponse Axios avec nos propres champs
 */
interface CustomAxiosResponse extends AxiosResponse {
    currentUserId: string | null,
}

/**
 * Callback de succès
 */
type SuccessCallback = (r: CustomAxiosResponse, data: Record<string, unknown>) => APIResponse | Promise<APIResponse> | null;

/**
 * Callback d'échec
 */
type FailureCallback = (r: AxiosResponse, data: Record<string, unknown>) => APIResponse | Promise<APIResponse> | null;

/**
 * Requête à l'API REST de Rocket.chat
 */
class RocketChatRequest {
    /**
     * Requête
     * @param HTTPMethod Méthode HTTP, comme GET ou POST
     * @param route Route / endpoint
     * @param authentication Authentification utilisée
     * @param res Réponse express
     * @param rawPayload Payload fourni
     * @param onSuccess Fonction appelée en cas de succès HTTP
     * @param onFailure Fonction appelée en cas d'échec HTTP
     * @param useAPIPrefix Utilise le préfixe API "/api/v1/" ou non. Très rarement faux.
     */
    public static async request(HTTPMethod: RequestMethod | string,
                                route: string,
                                authentication: Authentication | null = null,
                                res: Response | null,
                                rawPayload: Record<string, unknown> | null = null,
                                onSuccess: SuccessCallback | null = null,
                                onFailure: FailureCallback | null = null,
                                useAPIPrefix = true,
    ): Promise<void> {
        let payload = rawPayload;
        if (payload === null) {
            payload = {};
        }

        let accessRoute = route;
        if (HTTPMethod as RequestMethod === RequestMethod.GET) {
            // Cas spécial pour les requêtes GET, il faut les transformer en "/route?a=x&b=y"
            accessRoute = this._setGetPayload(route, payload);
        }

        // Headers envoyés à Rocket.chat
        let headers: AxiosRequestConfig = {
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (authentication !== null) {
            // Headers d'authentification
            headers.headers["X-User-Id"] = authentication.userId;
            headers.headers["X-Auth-Token"] = authentication.authToken;
        }

        await this._continueRequest(
            HTTPMethod as RequestMethod,
            accessRoute,
            headers,
            res,
            payload,
            onSuccess,
            onFailure,
            useAPIPrefix,
        );
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

    /**
     * Effectue la requête
     * @param HTTPMethod Méthode HTTP
     * @param route Route / endpoint
     * @param headers Headers
     * @param res Réponse Express, peut être nulle
     * @param payload Payload
     * @param onSuccessCallback Callback de succès
     * @param onFailureCallback Callback d'échec
     * @param useAPIPrefix Utilise le préfixe "/api/v1/" ou non
     * @private
     */
    private static async _continueRequest(HTTPMethod: RequestMethod,
                                          route: string,
                                          headers: AxiosRequestConfig,
                                          res: Response | null,
                                          payload: Record<string, unknown>,
                                          onSuccessCallback: SuccessCallback | null,
                                          onFailureCallback: FailureCallback | null,
                                          useAPIPrefix: boolean,
    ): Promise<void> {
        // Récupère la fonction Express à utiliser
        const {requestFunction, usePayload} = this._getMethodFunction(HTTPMethod);

        let onSuccess = onSuccessCallback;
        if (onSuccess === null) {
            // Fonction de succès par défaut
            onSuccess = (r, data) => {
                return APIResponse.fromSuccess(null, r.status);
            };
        }

        let onFailure = onFailureCallback;
        if (onFailure === null) {
            // Fonction d'échec par défaut
            onFailure = (r, data) => {
                let text = r.statusText;
                if (data.hasOwnProperty("error")) {
                    text = data.error as string;
                }
                return APIResponse.fromFailure(text, r.status);
            };
        }

        const APIRoute = useAPIPrefix ? RocketChat.getREST_Endpoint(route) : route;
        let promise: Promise<AxiosResponse>;
        if (usePayload) {
            // Méthodes utilisant un payload, comme POST
            promise = requestFunction(APIRoute, payload, headers);
        } else {
            // Méthodes n'utilisant pas de payload, comme GET
            promise = requestFunction(APIRoute, headers);
        }

        let promiseOrRes: APIResponse | Promise<APIResponse> | null = null;
        await promise.then(async (r) => {
            if (isValidStatusCode(r.status)) {
                // Réponse valide

                if (r.data.hasOwnProperty("success") && r.data.success !== true) {
                    console.debug("`r.data.success` is not true. Value:", r.data.success);
                }

                // ID de l'utilisateur, si présent
                let uid: string | null = null;
                if (r.config.headers.hasOwnProperty("X-User-Id")) {
                    uid = r.config.headers["X-User-Id"];
                }

                // Réponse Axios avec nos propres informations
                const customRes: CustomAxiosResponse = {
                    ...r,
                    currentUserId: uid,
                };

                promiseOrRes = (onSuccess as Function)(customRes, r.data);
            } else {
                // Réponse invalide, erreur
                promiseOrRes = (onFailure as Function)(r, r.data);
            }
        }).catch((err) => {
            if (err.code === "ECONNREFUSED") {
                // Rocket.chat n'est pas lancé
                console.error("Connection refusée avec Rocket.chat");
                promiseOrRes = APIResponse.fromFailure("Connection refused", 500);
            } else if (err.code === "ECONNRESET") {
                console.info("Socket hang up");
                promiseOrRes = null;
            } else if (err.response) {
                promiseOrRes = (onFailure as Function)(err.response, err.response.data);
            } else {
                // Erreur inconnue
                console.warn("Error with Rocket.chat REST API", err);
                promiseOrRes = APIResponse.fromFailure("Unknown error", 500);
            }
        });

        const resAPI: APIResponse | null = await promiseOrRes;
        if (resAPI !== null && res !== null) {
            // On envoie la réponse de l'API si nécessaire
            (<APIResponse>resAPI).send(res);
        }
    }

    /**
     * Configure le payload des requêtes GET
     * @param route Route de base
     * @param payload Payload
     * @private
     */
    private static _setGetPayload(route: string, payload: Record<string, unknown>): string {
        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return route;
        } else {
            let newRoute = route + "?";

            for (const key of keys) {
                const component = payload[key];
                newRoute += `${encodeURIComponent(key)}=${encodeURIComponent(component as string | number | boolean)}&`;
            }

            return newRoute.slice(0, -1);
        }
    }
}

export {RocketChatRequest};
