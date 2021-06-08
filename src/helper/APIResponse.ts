/**
 * Réponse API générique
 */
import {Response} from "express";

/**
 * Réponse API
 */
export default class APIResponse {
    /**
     * Data
     * @private
     */
    private readonly _data: Object = {};

    /**
     * Statut HTTP
     * @private
     */
    private _statusCode: number = 200;

    /**
     * Constructeur privé
     * @param data Data contenue
     * @param statusCode Code d'erreur
     * @private
     */
    private constructor(data: Object, statusCode: number = 200) {
        this._data = data;
        this._statusCode = statusCode;
    }

    /**
     * Échec
     * @param errorMessage Erreur
     * @param statusCode Code d'erreur
     * @param payload Payload
     * @param errorType Type d'erreur
     */
    static fromFailure(errorMessage: String = "",
                       statusCode: number = 400,
                       payload: Object|Object[]|null = null,
                       errorType: String = "request"
    ): APIResponse {
        return new APIResponse({
            "error": {
                "type": errorType,
            },
            "message": errorMessage,
            "payload": payload,
        }, statusCode);
    }

    /**
     * Succès
     * @param payload Payload
     * @param statusCode Code d'erreur
     * @param message Message
     */
    static fromSuccess(payload: Object|Object[]|null = null,
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
    static fromString(message: string = ""): APIResponse {
        return this.fromSuccess({
            "message": message
        });
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     */
    send(res: Response): Response {
        return res.status(this._statusCode).json(this._data);
    }
}
