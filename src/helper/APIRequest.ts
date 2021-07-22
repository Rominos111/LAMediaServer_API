/**
 * Requête effectuée par le client à l'API. Permet de définir les endpoint
 */

import express, {Request} from "express";
import expressWs from "express-ws";
import {
    APIRErrorType,
    APIResponse,
} from "helper/APIResponse";
import {Authentication} from "helper/authentication";
import {HTTPStatus} from "helper/requestMethod";
import {RocketChatWebSocket} from "helper/rocketChatWebSocket";
import {
    ObjectSchema,
    Validation,
} from "helper/validation";

import * as WebSocket from "ws";

/**
 * Callback des requêtes, avec `auth` éventuellement les détails d'authentification de l'utilisateur
 */
type RequestCallback = (req: express.Request, res: express.Response, auth: Authentication | null) => void;

/**
 * Requête effectuée par le client à l'API. Permet de définir les endpoint
 */
class APIRequest {
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
                         route: string = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.delete(route, Validation.delete(schema), expressCallback);
        return this._after(route, router);
    }

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
                      route: string = "/",
    ): express.Router {
        // On récupère le "vrai" callback Express et on le set
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.get(route, Validation.get(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * PATCH, remplace en partie une ressource
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static patch(validationSchema: ObjectSchema | null = null,
                        authenticationRequired: boolean,
                        callback: RequestCallback,
                        route: string = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.patch(route, Validation.patch(schema), expressCallback);
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
                       route: string = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.post(route, Validation.post(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * PUT, remplace intégralement une ressource
     * @param validationSchema Schéma de validation
     * @param authenticationRequired Authentification requise ou non
     * @param callback Callback
     * @param route Route locale, '/' par défaut
     * @see APIRequest.get
     */
    public static put(validationSchema: ObjectSchema | null = null,
                      authenticationRequired: boolean,
                      callback: RequestCallback,
                      route: string = "/",
    ): express.Router {
        const {expressCallback, router, schema} = this._before(validationSchema, authenticationRequired, callback);
        router.put(route, Validation.put(schema), expressCallback);
        return this._after(route, router);
    }

    /**
     * Route en cours de développement
     */
    public static wip(): express.Router {
        const router = express.Router();
        router.all("/", (_req: express.Request, res: express.Response) => {
            void _req;
            APIResponse.fromFailure("Not Implemented", HTTPStatus.NOT_IMPLEMENTED, {}, "access").send(res);
        });
        return router;
    }

    /**
     * WebSocket
     * @param validationSchema Schéma de validation
     * @param callback Callback appelé une fois la WebSocket ouverte
     * @param route Route locale, '/' par défaut
     */
    public static ws(validationSchema: ObjectSchema | null = null,
                     callback: (ws: WebSocket, req: express.Request, auth: Authentication | null, rcws: RocketChatWebSocket) => void,
                     route: string = "/",
    ): expressWs.Router {
        const router: expressWs.Router = express.Router();
        // On ouvre la route WebSocket
        router.ws(route, async (ws: WebSocket, req: express.Request) => {
            // Données d'authentification
            const auth = this._getAuthenticationData(req);
            // La requête peut se poursuivre ou non
            let canContinue = true;

            // "Bon" schéma de validation
            let schema = this._getValidationSchema(validationSchema, true);
            // La validation n'est appelée que lors de la demande d'ouverture de la WebSocket
            const valid = schema.validate(req.query);

            if (valid.error) {
                // Validation échouée, on ferme la socket avec un message
                console.debug("WebSocket validation error:", req.baseUrl, valid.error.message);
                ws.send({
                    error: {
                        type: APIRErrorType.VALIDATION,
                    },
                    message: valid.error.message,
                });
                canContinue = false;
            }

            if (canContinue) {
                if (auth === null) {
                    // Authentification échouée, on ferme la socket avec un message
                    console.debug("Invalid WebSocket token");
                    ws.send({
                        error: {
                            type: APIRErrorType.AUTHENTICATION,
                        },
                        message: "Invalid token",
                    });
                    canContinue = false;
                }
            }

            if (canContinue) {
                // On continue la procédure d'amorçage de la socket
                const rcws = RocketChatWebSocket.getSocket(req, ws);
                await rcws.open();
                callback(ws, req, auth, rcws);
            } else {
                // On ferme la WebSocket
                close();
            }
        });

        // Attention, ce morceau de code ne fonctionne que parce que les fichiers "*.rest.ts"
        //  sont chargés avant ceux "*.ws.ts"
        router.all(route, this._methodNotAllowed);
        return router;
    }

    /**
     * Récupère un schéma de validation valide, en ajoutant possiblement le token
     * @param validationSchema Schéma de validation de base
     * @param authenticationRequired Authentification requise ou non
     * @private
     */
    private static _getValidationSchema(validationSchema: ObjectSchema | null,
                                        authenticationRequired: boolean,
    ): ObjectSchema {
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
                           callback: RequestCallback,
    ): {
        expressCallback: (req: express.Request, res: express.Response) => void
        router: express.Router,
        schema: ObjectSchema,
    } {
        let schema = this._getValidationSchema(validationSchema, authenticationRequired);
        const expressCallback = (req: express.Request, res: express.Response) => {
            if (authenticationRequired) {
                const auth = this._getAuthenticationData(req);
                if (auth === null) {
                    APIResponse.fromFailure(
                        "Invalid token",
                        HTTPStatus.UNAUTHORIZED,
                        {},
                        APIRErrorType.AUTHENTICATION,
                    ).send(res);
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

        if (req.body.hasOwnProperty("_token")) {
            // Token dans le body
            token = req.body._token;
        } else if (req.query.hasOwnProperty("_token")) {
            // Token dans la query
            token = req.query._token as string;
        } else if (req.headers.hasOwnProperty("authorization")) {
            // Token dans le header
            token = (req.headers.authorization as string).split(" ")[1];
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
        APIResponse.fromFailure("Method Not Allowed", HTTPStatus.METHOD_NOT_ALLOWED, {}, "access").send(res);
    }
}

export {APIRequest};
