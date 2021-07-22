/**
 * Gestion des langues pour les réponses de l'API
 */

import fs from "fs";

/**
 * Gestion des langues
 */
abstract class Language {
    /**
     * Langue courante
     * @private
     */
    private static _lang: Record<string, string> = {};

    /**
     * Configuration de la langue
     * @param locale Locale, par exemple "fr-FR"
     */
    public static config(locale: string): void {
        const raw = fs.readFileSync(`lang/${locale}.json`, "utf-8");
        Language._lang = JSON.parse(raw);
    }

    /**
     * Récupère une chaine depuis un nom
     * @param key Clé, comme "validation.login.password.required"
     * @param replacementArray Remplacements, remplace tous les "%%" par les valeurs de ce tableau
     */
    public static get(key: string, ...replacementArray: unknown[]): string {
        const keyParts = key.split(".");
        let value: Record<string, string> | string | undefined = this._lang;
        for (const keyPart of keyParts) {
            if (typeof value === "object") {
                value = value[keyPart];
            }
        }

        if (typeof value === "string") {
            for (const replacement of replacementArray) {
                value = (value as string).replace("%%", replacement as string);
            }

            return value as string;
        } else {
            return "(unknown string)";
        }
    }
}

export {Language};
