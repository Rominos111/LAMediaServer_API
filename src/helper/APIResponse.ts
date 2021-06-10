/**
 * Réponse API générique
 */
import {Response} from "express";

/**
 * Type d'erreur
 */
enum APIRErrorType {
    /**
     * Erreur lors de la requête
     */
    REQUEST = "request",

    /**
     * Erreur lors de l'accès à la route, comme un 404 ou un 405
     */
    ACCESS = "access",

    /**
     * Erreur de validation
     */
    VALIDATION = "validation",

    /**
     * Erreur inconnue
     */
    UNKNOWN = "unknown",
}

/**
 * Réponse API
 */
class APIResponse {
    /**
     * Data
     * @private
     */
    private readonly _data: Object = {};

    /**
     * Statut HTTP
     * @private
     */
    private readonly _statusCode: number = 200;

    /**
     * headers supplémentaires
     * @private
     */
    private readonly _headers: Object = {};

    /**
     * Constructeur privé
     * @param data Data contenue
     * @param statusCode Code d'erreur
     * @param headers Headers supplémentaires
     * @private
     */
    private constructor(data: Object, statusCode: number = 200, headers: Object = {}) {
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
    public static fromFailure(errorMessage: String = "",
                              statusCode: number = 400,
                              payload: Object | Object[] | null = null,
                              errorType: APIRErrorType | string = "request"
    ): APIResponse {
        let headers = {};
        if (statusCode === 401 || statusCode === 403) {
            headers["WWW-Authenticate"] = `Bearer realm="Token for the LAMediaServer API", charset="UTF-8"`;
        }

        return new APIResponse({
            "error": {
                "type": <APIRErrorType>((<string>errorType).toLowerCase()),
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
    public static fromSuccess(payload: Object | Object[] | null = null,
                              statusCode: number = 200,
                              message: String = "OK"): APIResponse {
        return new APIResponse({
            "message": message,
            "payload": payload,
        }, statusCode);
    }

    /**
     * Depuis une chaine
     * @param message Message
     */
    public static fromString(message: string = ""): APIResponse {
        return this.fromSuccess({
            "message": message
        });
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     */
    public send(res: Response): Response {
        res = res.status(this._statusCode);
        res = res.type("json");

        for (let key of Object.keys(this._headers)) {
            res = res.set(key, this._headers[key]);
        }

        return res.json(this._data);
    }

    /**
     * Data raw
     */
    public getRaw(): Object {
        return this._data;
    }
}

export {APIResponse}
export default APIResponse;
