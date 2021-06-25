import ClientOAuth2 from "client-oauth2";

abstract class OAuth {
    private static _client: ClientOAuth2 | null = null;

    public static getClient(): ClientOAuth2 {
        let serverUri = "" +
            `${process.env.SERVER_PROTOCOL}://` +
            `${process.env.SERVER_ADDRESS}:` +
            `${process.env.SERVER_PORT}`;

        if (OAuth._client === null) {
            OAuth._client = new ClientOAuth2({
                clientId: "lams",
                clientSecret: "secret",
                accessTokenUri: process.env.OAUTH_ACCESS_TOKEN_URI,
                authorizationUri: process.env.OAUTH_AUTHORIZATION_URI,
                redirectUri: serverUri + "/oauth/userprofile",
                state: (Math.floor(Math.random() * Math.pow(2, 32))).toString(),
                scopes: [
                    "openid",
                ],
            });
        }

        return OAuth._client;
    }

    public static getUri(): string {
        return this.getClient().code.getUri();
    }

    public static getToken(originalUrl: string): Promise<ClientOAuth2.Token> {
        return this.getClient().code.getToken(originalUrl);
    }
}

export {OAuth};
