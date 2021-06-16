/**
 * Réponse API générique
 */
import {Response} from "express";

/**
 * Type d'erreur
 */
enum APIRErrorType {
    /**
     * Erreur lors de l'accès à la route, comme un 404 ou un 405
     */
    ACCESS = "access",

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
 * Réponse API
 */
class APIResponse {
    /**
     * Data
     * @private
     */
    private readonly _data: object;

    /**
     * headers supplémentaires
     * @private
     */
    private readonly _headers: object;

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
     * @private
     */
    private constructor(data: object = {}, statusCode = 200, headers: object = {}) {
        this._data = data;
        this._statusCode = statusCode;
        this._headers = headers;
    }

    /**
     * Échec
     * @param errorMessage Erreur
     * @param statusCode Code d'erreur
     * @param payload Payload
     * @param errorType Type d'erreur
     */
    public static fromFailure(errorMessage = "",
                              statusCode = 400,
                              payload: object | object[] | null = null,
                              errorType: APIRErrorType | string = "request",
    ): APIResponse {
        const headers = {};
        if (statusCode === 401 || statusCode === 403) {
            headers["WWW-Authenticate"] = `Bearer realm="Token for the LAMediaServer API", charset="UTF-8"`;
        }

        return new APIResponse({
            "error": {
                "type": ((errorType as string).toLowerCase()) as APIRErrorType,
            },
            "message": errorMessage,
            "payload": payload,
        }, statusCode, headers);
    }

    /**
     * Succès
     * @param payload Payload
     * @param statusCode Code d'erreur
     * @param message Message
     */
    public static fromSuccess(payload: object | object[] | null = null,
                              statusCode = 200,
                              message = "OK"): APIResponse {
        return new APIResponse({
            "message": message,
            "payload": payload,
        }, statusCode);
    }

    /**
     * Depuis une chaine
     * @param message Message
     */
    public static fromString(message = ""): APIResponse {
        return this.fromSuccess({
            "message": message,
        });
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     */
    public send(res: Response): Response {
        let response = res.status(this._statusCode);
        response = response.type("json");

        for (let key of Object.keys(this._headers)) {
            response = response.set(key, this._headers[key]);
        }

        return response.json(this._data);
    }

    /**
     * Data raw
     */
    public getRaw(): object {
        return this._data;
    }
}

export {APIResponse};
