import JWTLib from "jsonwebtoken";
import {createCipheriv, createDecipheriv} from "crypto";

export default abstract class JWT {
    private static _AES_encrypt(value: string) {
        let cipher = createCipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let encrypted = cipher.update(value, "ascii", "base64");
        return encrypted + cipher.final("base64");
    }

    private static _AES_decrypt(encrypted: string) {
        let decipher = createDecipheriv("aes-256-gcm", <string>process.env.AES_KEY, <string>process.env.AES_IV);
        let decrypted = decipher.update(encrypted, "base64", "ascii");
        return decrypted + decipher.final("ascii");
    }

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
