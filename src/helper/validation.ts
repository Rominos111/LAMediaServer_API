import express from "express";

import JoiValidator, {ExpressJoiInstance} from "express-joi-validation";
import Joi from "joi";

const validator: ExpressJoiInstance = JoiValidator.createValidator({
    passError: true,
});

/**
 * Validation des entrées
 */
abstract class Validation {
    //==================================================================================================================
    // Schémas JOI
    //==================================================================================================================

    public static any(): Joi.AnySchema {
        return Joi.any();
    }

    public static array(): Joi.ArraySchema {
        return Joi.array();
    }

    public static jwt(): Joi.StringSchema {
        return Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    }

    public static number(): Joi.NumberSchema {
        return Joi.number();
    }

    public static object(obj: object = {}): Joi.ObjectSchema {
        return Joi.object(obj);
    }

    public static string(): Joi.StringSchema {
        return Joi.string();
    }

    //==================================================================================================================
    // Méthodes HTTP
    //==================================================================================================================

    public static delete(schema: Joi.AnySchema): express.RequestHandler {
        return validator.body(schema);
    }

    public static get(schema: Joi.AnySchema): express.RequestHandler {
        return validator.query(schema);
    }

    public static post(schema: Joi.AnySchema): express.RequestHandler {
        return validator.body(schema);
    }
}

export {Validation};

type ObjectSchema = Joi.ObjectSchema;
export type {ObjectSchema};
