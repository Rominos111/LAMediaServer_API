/**
 * Réponse API générique
 */

import {Response} from "express";
import {HTTPStatus} from "helper/requestMethod";
import {Serializable} from "helper/serializable";

/**
 * Type d'erreur
 */
enum APIRErrorType {
    /**
     * Erreur lors de l'accès à la route, comme un 404 ou un 405
     */
    ACCESS = "access",

    /**
     * Erreur de token
     */
    AUTHENTICATION = "authentication",

    /**
     * Erreur lors de la requête
     */
    REQUEST = "request",

    /**
     * Erreur inconnue
     */
    UNKNOWN = "unknown",

    /**
     * Erreur de validation
     */
    VALIDATION = "validation",
}

/**
 * Type de réponse, type MIME
 */
enum ResponseType {
    JSON = "json",
    SVG = "image/svg+xml",
}

/**
 * Data complète renvoyée
 */
interface FullData {
    error?: {
        type: APIRErrorType,
    },
    message: string,
    payload: Record<string, unknown> | Serializable,
}

/**
 * Réponse API générique
 */
class APIResponse {
    /**
     * Data
     * @private
     */
    private readonly _data: FullData | Record<string, unknown>;

    /**
     * headers supplémentaires
     * @private
     */
    private readonly _headers: Record<string, string>;

    /**
     * Type de réponse
     * @private
     */
    private readonly _responseType: ResponseType;

    /**
     * Statut HTTP
     * @private
     */
    private readonly _statusCode: number;

    /**
     * Constructeur privé
     * @param data Data contenue
     * @param statusCode Code d'erreur
     * @param headers Headers supplémentaires
     * @param responseType Type de réponse (JSON, SVG...)
     * @private
     */
    private constructor(data: FullData | Record<string, unknown>,
                        statusCode: HTTPStatus = HTTPStatus.OK,
                        headers: Record<string, string> = {},
                        responseType: ResponseType = ResponseType.JSON,
    ) {
        this._data = data;
        this._statusCode = statusCode;
        this._headers = headers;
        this._responseType = responseType;
    }

    /**
     * Échec
     * @param errorMessage Erreur
     * @param statusCode Code d'erreur
     * @param payload Payload
     * @param errorType Type d'erreur
     */
    public static fromFailure(errorMessage: string,
                              statusCode: HTTPStatus | number,
                              payload: Record<string, unknown> = {},
                              errorType: APIRErrorType | string = "request",
    ): APIResponse {
        const headers = {};
        if (statusCode === HTTPStatus.UNAUTHORIZED || statusCode === HTTPStatus.FORBIDDEN) {
            // Envoi d'un header informant de l'existence du header "WWW-Authenticate"
            headers["WWW-Authenticate"] = "Basic realm=\"Token pour LAMediaServer\", charset=\"UTF-8\"";
        }

        return new APIResponse({
            error: {
                type: ((errorType as string).toLowerCase()) as APIRErrorType,
            },
            message: errorMessage,
            payload,
        }, statusCode, headers);
    }

    /**
     * Succès
     * @param payload Payload
     * @param statusCode Code d'erreur
     * @param message Message
     */
    public static fromSuccess(payload: Record<string, unknown> | Serializable = {},
                              statusCode: HTTPStatus | number = HTTPStatus.OK,
                              message: string = "OK",
    ): APIResponse {
        return new APIResponse({
            message,
            payload,
        }, statusCode);
    }

    /**
     * Objet brut, comme un fichier SVG ou un fichier binaire
     * @param rawObject Objet brut
     * @param statusCode Code d'erreur
     * @param responseType Type de réponse
     */
    public static fromRaw(rawObject: Record<string, unknown>,
                          statusCode: HTTPStatus | number = HTTPStatus.OK,
                          responseType: ResponseType = ResponseType.JSON,
    ): APIResponse {
        return new APIResponse(rawObject, statusCode, {}, responseType);
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     */
    public send(res: Response): Response {
        let response = res.status(this._statusCode);

        for (const key of Object.keys(this._headers)) {
            response = response.set(key, this._headers[key]);
        }

        response = response.type(this._responseType as string);
        return response.send(this._data);
    }

    /**
     * Data raw
     */
    public getRaw(): FullData | Record<string, unknown> {
        return this._data;
    }
}

export {
    APIRErrorType,
    APIResponse,
    ResponseType,
};
