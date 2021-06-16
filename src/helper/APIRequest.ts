import express from "express";
import {APIResponse} from "helper/APIResponse";
import {Validation, ObjectSchema} from "helper/validation";

/**
 * Requête API
 */
class APIRequest {
    /**
     * GET
     * @param validationSchema Schéma de validation
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     */
    public static get(validationSchema: ObjectSchema | null = null,
                      callback: (req: express.Request, res: express.Response) => void,
                      route = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation
        router.get(route, Validation.get(validationSchema), callback);

        // Erreur 405 pour les autres méthodes
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
    public static post(validationSchema: ObjectSchema | null = null,
                       callback: (req: express.Request, res: express.Response) => void,
                       route = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation
        router.post(route, Validation.post(validationSchema), callback);

        // Erreur 405 pour les autres méthodes
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
    public static delete(validationSchema: ObjectSchema | null = null,
                         callback: (req: express.Request, res: express.Response) => void,
                         route = "/"
    ): express.Router {
        if (validationSchema === null) {
            validationSchema = Validation.object({});
        }

        validationSchema = validationSchema.append({
            _token: Validation.jwt(),
        });

        let router = express.Router();

        // Validation
        router.delete(route, Validation.delete(validationSchema), callback);

        // Erreur 405 pour les autres méthodes
        router.all(route, this._methodNotAllowed);
        return router;
    }

    public static wip(): express.Router {
        let router = express.Router();
        router.all("/", (_req, res) => {
            APIResponse.fromFailure("Not Implemented", 501, null, "access").send(res);
        });
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

export {APIRequest};
