import express, {Request} from "express";
import expressWs from "express-ws";
import {APIResponse} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {
    ObjectSchema,
    Validation,
} from "helper/validation";

import * as WebSocket from "ws";

/**
 * Callback des requêtes
 */
type RequestCallback = (req: express.Request, res: express.Response, auth: Authentication | null) => void;

/**
 * Requête effectuée par le client à l'API. Permet de définir l'endpoint
 */
class APIRequest {
    /**
     * GET
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     */
    public static get(validationSchema: ObjectSchema | null = null,
                      authenticationRequired: boolean,
                      callback: RequestCallback,
                      route = "/",
    ): express.Router {
        // On récupère le "vrai" callback Express et on le set
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.get(route, Validation.get(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static post(validationSchema: ObjectSchema | null = null,
                       authenticationRequired: boolean,
                       callback: RequestCallback,
                       route = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.post(route, Validation.post(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * POST
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static delete(validationSchema: ObjectSchema | null = null,
                         authenticationRequired: boolean,
                         callback: RequestCallback,
                         route = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.delete(route, Validation.delete(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * PUT
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static put(validationSchema: ObjectSchema | null = null,
                      authenticationRequired: boolean,
                      callback: RequestCallback,
                      route = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.put(route, Validation.delete(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * Route en cours de développement
     */
    public static wip(): express.Router {
        const router = express.Router();
        router.all("/", (_req, res) => {
            void _req;
            APIResponse.fromFailure("Not Implemented", 501, null, "access").send(res);
        });
        return router;
    }

    /**
     * WebSocket
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback appelé une fois la WebSocket ouverte
     * @param route Route locale, '/' par défaut
     */
    public static ws(validationSchema: ObjectSchema | null = null,
                     authenticationRequired: boolean,
                     callback: (ws: WebSocket, req: express.Request) => void,
                     route = "/",
    ): expressWs.Router {
        // La validation n'est appelée que lors de la demande d'ouverture de la WebSocket
        const validation = (ws: WebSocket, req: express.Request, next: express.NextFunction) => {
            let canContinue = true;

            let schema = this._getValidationSchema(validationSchema, authenticationRequired);
            const valid = schema.validate(req.query);

            if (valid.error) {
                // Validation échouée
                console.debug("WebSocket validation error:", valid.error.message);
                canContinue = false;
            }

            if (canContinue && authenticationRequired) {
                const auth = this._getAuthenticationData(req);
                if (auth === null) {
                    console.debug("Invalid WebSocket token");
                    canContinue = false;
                }
            }

            if (canContinue) {
                next();
            } else {
                // On ferme la WebSocket
                close();
            }
        };

        const router: expressWs.Router = express.Router();
        router.ws(route, validation, (ws: WebSocket, req: express.Request) => {
            callback(ws, req);
        });
        router.all(route, this._methodNotAllowed);
        return router;
    }

    private static _getValidationSchema(validationSchema: ObjectSchema | null,
                                        authenticationRequired: boolean): ObjectSchema {
        let schema = validationSchema;
        if (schema === null) {
            schema = Validation.object({});
        }

        if (authenticationRequired) {
            schema = schema.append({
                _token: Validation.jwt(),
            });
        }

        return schema;
    }

    /**
     * Routine exécutée en amont de chaque requête
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @private
     */
    private static _before(validationSchema: ObjectSchema | null,
                           authenticationRequired: boolean,
                           callback: RequestCallback): {
        expressCallback: (req: express.Request, res: express.Response) => void
        router: express.Router,
        schema: ObjectSchema,
    } {
        let schema = this._getValidationSchema(validationSchema, authenticationRequired);
        const expressCallback = (req, res) => {
            if (authenticationRequired) {
                const auth = this._getAuthenticationData(req);
                if (auth === null) {
                    APIResponse.fromFailure("Invalid token", 401).send(res);
                } else {
                    callback(req, res, auth);
                }
            } else {
                callback(req, res, null);
            }
        };

        return {
            expressCallback: expressCallback,
            router: express.Router(),
            schema,
        };
    }

    /**
     * Routine post-requête
     * @param route Route locale
     * @param router Routeur Express
     * @private
     */
    private static _after(route: string, router: express.Router): express.Router {
        // Erreur 405 pour les autres méthodes HTTP que celle utilisée
        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * Récupère les données d'authentification d'une requête Express
     * @private
     */
    private static _getAuthenticationData(req: Request): Authentication | null {
        let token: string | null = null;

        if (req.body._token !== undefined) {
            // Token dans le body
            token = req.body._token;
        } else if (req.query._token !== undefined) {
            // Token dans la query
            token = req.query._token as string;
        } else if (req.headers.authorization !== undefined) {
            // Token dans le header
            token = req.headers.authorization.split(" ")[1];
        }

        if (token === null) {
            return null;
        } else {
            const auth = Authentication.fromToken(token);
            if (auth === null) {
                return null;
            } else {
                return auth;
            }
        }
    }

    /**
     * Méthode non autorisée
     * @private
     */
    private static _methodNotAllowed(_req: express.Request, res: express.Response): void {
        void _req;
        APIResponse.fromFailure("Method Not Allowed", 405, null, "access").send(res);
    }
}

export {APIRequest};
