import {ExpressJoiInstance} from "express-joi-validation";
import Joi from "joi";

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

    public static object(obj: Object = {}): Joi.ObjectSchema {
        return Joi.object(obj);
    }

    public static string(): Joi.StringSchema {
        return Joi.string();
    }

    public static number(): Joi.NumberSchema {
        return Joi.number();
    }

    public static jwt(): Joi.StringSchema {
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
