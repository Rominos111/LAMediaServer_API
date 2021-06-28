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

interface CustomAxiosResponse extends AxiosResponse {
    currentUserId: string | null,
}

type SuccessCallback = (r: CustomAxiosResponse, data: any) => APIResponse | Promise<APIResponse> | null;
type FailureCallback = (r: AxiosResponse, data: any) => APIResponse | Promise<APIResponse> | null;

/**
 * Requête à l'API de Rocket.chat
 */
class RocketChatRequest {
    /**
     * Requête
     * @param HTTPMethod Méthode HTTP, comme GET ou POST
     * @param route Route / endpoint
     * @param authentication Authentification
     * @param res Réponse express
     * @param rawPayload Payload fourni
     * @param onSuccess Fonction appelée en cas de succès HTTP (2XX)
     * @param onFailure Fonction appelée en cas d'échec HTTP
     * @param useAPIPrefix Utilise le préfixe API "/api/v1/" ou non. Très rarement faux.
     */
    public static async request(HTTPMethod: RequestMethod | string,
                                route: string,
                                authentication: Authentication | null = null,
                                res: Response | null,
                                rawPayload: object | null = null,
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

    private static async _continueRequest(HTTPMethod: RequestMethod,
                                          route: string,
                                          headers: AxiosRequestConfig,
                                          res: Response | null,
                                          payload: object,
                                          onSuccessCallback: SuccessCallback | null,
                                          onFailureCallback: FailureCallback | null,
                                          useAPIPrefix: boolean,
    ): Promise<void> {
        const {requestFunction, usePayload} = this._getMethodFunction(HTTPMethod);

        let onSuccess = onSuccessCallback;
        if (onSuccess === null) {
            // Fonction de succès par défaut
            onSuccess = (r, data) => {
                console.debug(data);
                return APIResponse.fromSuccess(null, r.status);
            };
        }

        let onFailure = onFailureCallback;
        if (onFailure === null) {
            // Fonction d'échec par défaut
            onFailure = (r, data) => {
                console.debug(data);
                return APIResponse.fromFailure(r.statusText, r.status);
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

                if (r.data.success !== true && r.data.success !== undefined) {
                    console.log("`r.data.success` is not true. Value:", r.data.success);
                }

                let uid = null;
                if (r.config.headers["X-User-Id"] !== undefined) {
                    uid = r.config.headers["X-User-Id"];
                }

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
                console.debug(err);
                promiseOrRes = APIResponse.fromFailure("Unknown error", 500);
            }
        });

        const resAPI: APIResponse | null = await promiseOrRes;
        if (resAPI !== null && res !== null) {
            (<APIResponse>resAPI).send(res);
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

export {
    RocketChatRequest,
};
