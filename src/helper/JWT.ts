import JWTLib from "jsonwebtoken";

export default class JWT {
    static create(userId: string, authToken: string, username: string): string {
        let payload = {
            userId: userId,
            authToken: authToken
        };

        return JWTLib.sign(payload, <string>process.env.JWT_SECRET, {
            expiresIn: "24h",
            issuer: `${process.env.SERVER_ADDRESS}:${process.env.SERVER_PORT}`,
            subject: username
        });
        // TODO: aud et sub
    }
}
