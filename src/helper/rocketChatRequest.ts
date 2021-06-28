import axios, {
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import {
    Request,
    Response,
} from "express";
import {APIResponse} from "helper/APIResponse";
import {RequestMethod} from "helper/requestMethod";
import {
    RocketChat,
    RocketChatAuthentication,
} from "helper/rocketChat";

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
     * @param authReq Authentification requise ou non
     * @param res Réponse express
     * @param rawPayload Payload fourni
     * @param onSuccess Fonction appelée en cas de succès HTTP (2XX)
     * @param onFailure Fonction appelée en cas d'échec HTTP
     * @param useAPIPrefix Utilise le préfixe API "/api/v1/" ou non. Très rarement faux.
     */
    public static async request(HTTPMethod: RequestMethod | string,
                                route: string,
                                authReq: Request | null = null,
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

        let tokenAllowed = true;
        if (authReq !== null) {
            const auth = this._getAuthenticationData(authReq as Request, HTTPMethod as RequestMethod);

            if (auth === null) {
                tokenAllowed = false;
            } else {
                // Headers d'authentification
                headers.headers["X-User-Id"] = auth.userId;
                headers.headers["X-Auth-Token"] = auth.authToken;
            }
        }

        if (tokenAllowed) {
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
        } else if (res !== null) {
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
            if (this._isGoodStatusCode(r.status)) {
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

    private static _isGoodStatusCode(statusCode: number): boolean {
        return [200, 201, 204, 304].includes(statusCode);
    }

    private static _getAuthenticationData(req: Request, _method: RequestMethod): RocketChatAuthentication | null {
        let token: string | null = null;

        if (req.body._token !== undefined) {
            token = req.body._token;
        } else if (req.headers["authorization"] !== undefined) {
            token = req.headers["authorization"].split(" ")[1];
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

export {
    RocketChatRequest,

};
