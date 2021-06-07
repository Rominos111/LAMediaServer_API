import axios, {AxiosResponse} from "axios";
import {Response} from "express";
import RocketChat, {RocketChatAuthentication} from "helper/rocketChat";
import APIResponse from "helper/APIResponse";

/**
 * Méthodes de requête
 */
enum RequestMethod {
    /**
     * Récupération, listing. Cacheable
     */
    GET,

    /**
     * Update, remplace complètement
     */
    PUT,

    /**
     * Update, remplace partiellement
     */
    PATCH,

    /**
     * Crée
     */
    POST,

    /**
     * Supprime
     */
    DELETE,
}

function getMethodFunction(method: RequestMethod|string) {
    switch (String(method)) {
        case "GET":
            method = RequestMethod.GET;
            break;

        case "PUT":
            method = RequestMethod.PUT;
            break;

        case "PATCH":
            method = RequestMethod.PATCH;
            break;

        case "POST":
            method = RequestMethod.POST;
            break;

        case "DELETE":
            method = RequestMethod.DELETE;
            break;

        default:
            throw new Error("No such HTTP method");
    }

    switch (method) {
        case RequestMethod.GET:
            return axios.get;

        case RequestMethod.PUT:
            return axios.put;

        case RequestMethod.PATCH:
            return axios.patch;

        case RequestMethod.POST:
            return axios.post;

        case RequestMethod.DELETE:
            return axios.delete;

        default:
            throw new Error("No such HTTP method");
    }
}

class RocketChatRequest {
    static request(method: RequestMethod|string,
                   route: string,
                   auth: RocketChatAuthentication|string|null = null,
                   res: Response,
                   payload: Object|null,
                   onSuccess: ((r: AxiosResponse) => APIResponse)|null = null,
                   onFailure: ((r: AxiosResponse) => APIResponse)|null = null,
                   onError: ((r: any) => APIResponse)|null = null,
                   ) {
        let methodFunction = getMethodFunction(method);
        let headers: object|undefined = undefined;

        if (typeof auth === "string") {
            auth = RocketChatAuthentication.fromToken(auth);
        }

        if (auth !== null) {
            headers = {
                "X-User-Id": auth.userId,
                "X-Auth-Token": auth.authToken,
            }
        }

        methodFunction(RocketChat.getAPIUrl(route), payload, headers).then((r) => {
            if (Math.floor(r.status / 100) === 2) {
                if (onSuccess === null) {
                    APIResponse.fromError(r.statusText).setStatusCode(r.status).send(res);
                } else {
                    onSuccess(r).send(res);
                }
            } else {
                if (onFailure === null) {
                    APIResponse.fromError(r.statusText).setStatusCode(r.status).send(res);
                } else {
                    onFailure(r).send(res);
                }
            }
        }).catch((err) => {
            console.debug(err);
            if (onError === null) {
                if (err.code && err.code === "ECONNREFUSED") {
                    APIResponse.fromError("Connection refused").setStatusCode(500).send(res);
                } else if (err.response) {
                    APIResponse.fromError(err.response.statusText).setStatusCode(err.response.status).send(res);
                } else {
                    APIResponse.fromError("Unknown error").setStatusCode(500).send(res);
                }
            } else {
                onError(err).send(res);
            }
        })
    }
}

export default RocketChatRequest;
export {RocketChatRequest, RequestMethod}
