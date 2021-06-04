import Joi from "joi";

export default abstract class Validation {
    /**
     * Login
     */
    public static formLoginSchema = Joi.object({
        username: Joi.string().alphanum().min(3).max(32).required().messages({
            "string.empty": "Votre nom d'utilisateur ne peut pas être vide",
            "string.min": "Votre nom d'utilisateur est trop court",
            "string.max": "Votre nom d'utilisateur est trop long",
            "any.required": "Vous devez fournir votre nom d'utilisateur"
        }),
        password: Joi.string().min(8).required().messages({
            "string.empty": "Votre mot de passe ne peut pas être vide",
            "string.min": "Votre mot de passe est trop court",
            "string.max": "Votre mot de passe est trop long",
            "any.required": "Vous devez fournir votre mot de passe"
        }),
        _csrf: Joi.string() // FIXME: .required() ?
    });
}
