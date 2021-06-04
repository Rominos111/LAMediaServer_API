/**
 * Réponse API générique
 */
import {Response} from "express";

export default class APIResponse {
    /**
     * Data
     * @private
     */
    private readonly data: Object = {};

    /**
     * Constructeur privé
     * @param data Data contenue
     * @private
     */
    private constructor(data: Object) {
        this.data = data;
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
     * Send the response
     * @param res Express response variable
     * @param statusCode HTTP status code
     */
    send(res: Response, statusCode: number = 200): Response {
        return res.status(statusCode).json(this.data);
    }
}
