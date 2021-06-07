import JWTLib from "jsonwebtoken";
import {createCipheriv, createDecipheriv} from "crypto";

export default class JWT {
    private static _AES_encrypt(value: string) {
        console.log(process.env.AES_KEY);
        let cipher = createCipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let encrypted = cipher.update(value, "ascii", "base64");
        return encrypted + cipher.final("base64");
    }

    private static _AES_decrypt(encrypted: string) {
        let decipher = createDecipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let decrypted = decipher.update(encrypted, "base64", "ascii");
        return decrypted + decipher.final("ascii");
    }

    static create(userId: string, authToken: string, username: string): string {
        let payload = {
            userId: userId,
            authToken: this._AES_encrypt(authToken)
        };

        return JWTLib.sign(payload, <string>process.env.JWT_SECRET, {
            expiresIn: "24h",
            issuer: `${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`,
            subject: username
        });
        // TODO: aud ?
    }
}
