import Joi from "joi";
import Language from "helper/language";

/**
 * Validation des entrées
 */
export default abstract class Validation {
    /**
     * Login
     */
    public static formLoginSchema = Joi.object({
        username: Joi.string().alphanum().min(3).max(32).required().messages({
            "string.empty": Language.get("validation.login.username.empty"),
            "string.min": Language.get("validation.login.username.short"),
            "string.max": Language.get("validation.login.username.long"),
            "any.required": Language.get("validation.login.username.required")
        }),
        password: Joi.string().min(8).required().messages({
            "string.empty": Language.get("validation.login.password.empty"),
            "string.min": Language.get("validation.login.password.short"),
            "string.max": Language.get("validation.login.password.long"),
            "any.required": Language.get("validation.login.password.required")
        }),
    });
}
