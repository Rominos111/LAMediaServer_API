import {randomBytes} from "crypto";
import dotenv from "dotenv";
import Language from "helper/language";

export default abstract class envConfig {
    public static config(): void {
        dotenv.config();

        if (process.env.SESSION_SECRET === undefined || process.env.SESSION_SECRET === "") {
            process.env.SESSION_SECRET = randomBytes(64).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT === "prod") {
                console.info("Session secret:", process.env.SESSION_SECRET);
            }
        }

        if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === "") {
            process.env.JWT_SECRET = randomBytes(64).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT === "prod") {
                console.info("JWT secret:", process.env.JWT_SECRET);
            }
        }

        if (process.env.AES_KEY === undefined || process.env.AES_KEY === "") {
            process.env.AES_KEY = randomBytes(16).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT === "prod") {
                console.info("AES key:", process.env.AES_KEY);
            }
        }

        if (process.env.AES_IV === undefined || process.env.AES_IV === "") {
            process.env.AES_IV = randomBytes(8).toString("hex");
            if (process.env.RELEASE_ENVIRONMENT === "prod") {
                console.info("AES IV:", process.env.AES_IV);
            }
        }

        Language.config("fr-FR");
    }
}
