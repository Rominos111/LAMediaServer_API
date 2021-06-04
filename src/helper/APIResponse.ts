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
     * Depuis une chaine
     * @param message Message
     */
    static fromString(message: string = ""): APIResponse {
        return new APIResponse({
            "message": message
        });
    }

    /**
     * Envoie la réponse
     * @param res Variable de réponse de Express
     * @param statusCode Code HTTP
     */
    send(res: Response, statusCode: number = 200): Response {
        return res.status(statusCode).json(this._data);
    }
}
