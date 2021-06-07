import JWTLib from "jsonwebtoken";
import {createCipheriv, createDecipheriv} from "crypto";

/**
 * Gestion des JWT
 */
export default abstract class JWT {
    /**
     * Chiffrement AES
     * @param value Valeur à chiffrer
     * @private
     */
    private static _AES_encrypt(value: string): string {
        let cipher = createCipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let encrypted = cipher.update(value, "ascii", "base64");
        return encrypted + cipher.final("base64");
    }

    /**
     * Déchiffrement AES
     * @param encrypted Valeur chiffrée
     * @private
     */
    private static _AES_decrypt(encrypted: string): string {
        let decipher = createDecipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let decrypted = decipher.update(encrypted, "base64", "ascii");
        return decrypted + decipher.final("ascii");
    }

    /**
     * Crée un token
     * @param userId ID de l'utilisateur, fourni par Rocket.chat
     * @param authToken Token d'authentification de l'utilisateur, fourni par Rocket.chat
     * @param username Nom d'utilisateur Rocket.chat
     */
    static createToken(userId: string, authToken: string, username: string): string {
        let payload = {
            data: {
                userId: userId,
                authToken: this._AES_encrypt(authToken),
            },
        };

        return JWTLib.sign(payload, <string>process.env.JWT_SECRET, {
            expiresIn: "24h",
            issuer: `${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`,
            subject: username
        });
        // TODO: aud ?
    }

    /**
     * Décode un token
     * @param token Token JWT
     */
    static decodeToken(token: string): {userId: string, authToken: string}|null {
        let obj: any|null;
        try {
            obj = JWTLib.verify(token, <string>process.env.JWT_SECRET);
            obj = obj.data;
        } catch (err) {
            obj = null;
        }

        return obj;
    }
}
