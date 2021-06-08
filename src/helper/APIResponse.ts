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
     * @private
     */
    private constructor(data: Object) {
        this._data = data;
    }

    /**
     * Depuis un objet
     * @param data Data
     */
    static fromObject(data: Object = {}): APIResponse {
        return new APIResponse(data);
    }

    /**
     * Depuis un objet
     * @param data Data
     */
    static fromArray(data: Object[] = []): APIResponse {
        return new APIResponse(data);
    }

    /**
     * Depuis une erreur
     * @param errorMessage Erreur
     * @param errorType Type d'erreur
     */
    static fromError(errorMessage: String = "", errorType: String = "request"): APIResponse {
        return new APIResponse({
            "error": true,
            "type": errorType,
            "message": errorMessage
        });
    }

    /**
     * Depuis une chaine
     * @param message Message
     */
    static fromString(message: string = ""): APIResponse {
        return new APIResponse({
            "message": message
        });
    }

    /**
     * Set le code HTTP
     * @param statusCode Code HTTP
     */
    setStatusCode(statusCode: number): APIResponse {
        this._statusCode = statusCode;
        return this;
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     */
    send(res: Response): Response {
        return res.status(this._statusCode).json(this._data);
    }
}
