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
    public static get(validationSchema: Joi.ObjectSchema | null = null,
                      callback: (req: express.Request, res: express.Response) => void,
                      route: string = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation, GET
        router.get(route, Validation.get(validationSchema), callback);

        // Erreur 405 pour les autres méthodes que GET
        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static post(validationSchema: Joi.ObjectSchema | null = null,
                       callback: (req: express.Request, res: express.Response) => void,
                       route: string = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation, GET
        router.post(route, Validation.post(validationSchema), callback);

        // Erreur 405 pour les autres méthodes que GET
        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static delete(validationSchema: Joi.ObjectSchema | null = null,
                         callback: (req: express.Request, res: express.Response) => void,
                         route: string = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation, GET
        router.delete(route, Validation.delete(validationSchema), callback);

        // Erreur 405 pour les autres méthodes que GET
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
