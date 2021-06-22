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

enum ResponseType {
    JSON,
    SVG,
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
    private constructor(data: object = {},
                        statusCode = 200,
                        headers: object = {},
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
    public static fromFailure(errorMessage = "",
                              statusCode = 400,
                              payload: object | object[] | null = null,
                              errorType: APIRErrorType | string = "request",
    ): APIResponse {
        const headers = {};
        if (statusCode === 401 || statusCode === 403) {
            headers["WWW-Authenticate"] = "Bearer realm=\"Token for the LAMediaServer API\", charset=\"UTF-8\"";
            // FIXME: `Basic` plutôt non ?
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
    public static fromSuccess(payload: object | object[] | null = null,
                              statusCode = 200,
                              message = "OK",
    ): APIResponse {
        return new APIResponse({
            message,
            payload,
        }, statusCode);
    }

    public static fromRaw(rawObject: any,
                          statusCode = 200,
                          responseType: ResponseType = ResponseType.JSON,
    ): APIResponse {
        return new APIResponse(rawObject, statusCode, undefined, responseType);
    }

    /**
     * Depuis une chaine
     * @param message Message
     */
    public static fromString(message = ""): APIResponse {
        return this.fromSuccess({
            message,
        });
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

        if (this._responseType === ResponseType.SVG) {
            response = response.type("image/svg+xml");
            return response.send(this._data);
        } else if (this._responseType === ResponseType.JSON || true) {
            response = response.type("json");
            return response.json(this._data);
        }
    }

    /**
     * Data raw
     */
    public getRaw(): object {
        return this._data;
    }
}

export {
    APIResponse,
    ResponseType,
};
