/**
 * Configuration de l'environnement
 */

import {randomBytes} from "crypto";
import dotenv from "dotenv";
import {Language} from "helper/language";

/**
 * Configuration de l'environnement
 */
abstract class envConfig {
    /**
     * Configuration
     */
    public static config(): void {
        // Chargement du .env
        dotenv.config();

        // Secret de session
        if (!process.env.hasOwnProperty("SESSION_SECRET") || process.env.SESSION_SECRET === "") {
            process.env.SESSION_SECRET = randomBytes(64).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT !== "prod") {
                console.info("Session secret:", process.env.SESSION_SECRET);
            }
        }

        // Secret JWT
        if (!process.env.hasOwnProperty("JWT_SECRET") || process.env.JWT_SECRET === "") {
            process.env.JWT_SECRET = randomBytes(64).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT !== "prod") {
                console.info("JWT secret:", process.env.JWT_SECRET);
            }
        }

        // Secret clé AES
        if (!process.env.hasOwnProperty("AES_KEY") || process.env.AES_KEY === "") {
            process.env.AES_KEY = randomBytes(16).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT !== "prod") {
                console.info("AES key:", process.env.AES_KEY);
            }
        }

        // Secret IV AES
        if (!process.env.hasOwnProperty("AES_IV") || process.env.AES_IV === "") {
            process.env.AES_IV = randomBytes(8).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT !== "prod") {
                console.info("AES IV:", process.env.AES_IV);
            }
        }

        // Chargement de la langue
        Language.config("fr-FR");
    }
}

export {envConfig};
