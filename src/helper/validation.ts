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

    public static object(obj: Object = {}) {
        return Joi.object(obj);
    }

    public static string() {
        return Joi.string();
    }

    public static number() {
        return Joi.number();
    }

    public static jwt() {
        return Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    }

    //==================================================================================================================
    // Méthodes HTTP
    //==================================================================================================================

    public static get(schema: Joi.AnySchema) {
        return validator.body(schema);
    }

    public static query(schema: Joi.AnySchema) {
        return validator.query(schema);
    }

    public static post(schema: Joi.AnySchema) {
        return validator.body(schema);
    }
}
