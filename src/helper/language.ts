import fs from "fs";

/**
 * Gestion des langues
 */
export default abstract class Language {
    /**
     * Langue courante
     * @private
     */
    private static _lang: Object = {};

    /**
     * Configuration de la langue
     * @param locale Locale, par exemple "fr-FR"
     */
    static config(locale: string): void {
        const raw = fs.readFileSync(`lang/${locale}.json`, "utf-8");
        Language._lang = JSON.parse(raw);
    }

    /**
     * Récupère une chaine depuis un nom
     * @param rawKey Clé, comme "validation.login.password.required"
     * @param replacementArray Remplacements, remplace tous les "%%" par les valeurs de ce tableau
     */
    static get(rawKey: string, ...replacementArray: Object[]): string {
        const keys = rawKey.split(".");
        let value: Object|string|undefined = this._lang;
        for (const key of keys) {
            if (typeof value === "object") {
                value = value[key];
            }
        }

        if (typeof value === "string") {
            for (const replacement of replacementArray) {
                value = (<string>value).replace("%%", <string>replacement);
            }

            return <string>value;
        } else {
            return "(unknown string)";
        }
    }
}
