import express from "express";
import APIResponse from "helper/APIResponse";
import Validation from "helper/validation";
import Joi from "joi";

/**
 * Requête API
 */
export default class APIRequest {
    /**
     * GET
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     */
    public static get(validationSchema: Joi.AnySchema | null = null,
                      callback: (req: express.Request, res: express.Response) => void,
                      route: string = "/"
    ): express.Router {
        let router = express.Router();
        if (validationSchema === null) {
            router.get(route, callback);
        } else {
            router.get(route, Validation.get(validationSchema), callback);
        }

        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     */
    public static post(validationSchema: Joi.AnySchema | null = null,
                       callback: (req: express.Request, res: express.Response) => void,
                       route: string = "/"
    ): express.Router {
        let router = express.Router();
        if (validationSchema === null) {
            router.post(route, callback);
        } else {
            router.post(route, Validation.post(validationSchema), callback);
        }

        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     */
    public static delete(validationSchema: Joi.AnySchema | null = null,
                         callback: (req: express.Request, res: express.Response) => void,
                         route: string = "/"
    ): express.Router {
        let router = express.Router();
        if (validationSchema === null) {
            router.delete(route, callback);
        } else {
            router.delete(route, Validation.delete(validationSchema), callback);
        }

        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * Méthode non autorisée
     * @private
     */
    private static _methodNotAllowed(_req: express.Request, res: express.Response): void {
        APIResponse.fromFailure("Method Not Allowed", 405, null, "access").send(res);
    }
}
