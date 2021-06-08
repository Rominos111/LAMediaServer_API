import Joi from "joi";
import {ExpressJoiInstance} from "express-joi-validation";

const validator: ExpressJoiInstance = require("express-joi-validation").createValidator({
    passError: true
});

/**
 * Validation des entrées
 */
export default abstract class Validation {
    //==================================================================================================================
    // Schémas JOI
    //==================================================================================================================

    static object(obj: Object = {}) {
        return Joi.object(obj);
    }

    static string() {
        return Joi.string();
    }

    static jwt() {
        return Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    }

    //==================================================================================================================
    // Méthodes HTTP
    //==================================================================================================================

    static get(schema: Joi.AnySchema) {
        return validator.params(schema);
    }

    static query(schema: Joi.AnySchema) {
        return validator.query(schema);
    }

    static post(schema: Joi.AnySchema) {
        return validator.body(schema);
    }
}
