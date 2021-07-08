/**
 * Informations relatives à Rocket.chat
 */

/**
 * Informations relatives à Rocket.chat
 */
class RocketChat {
    /**
     * Récupère l'URL de l'API REST Rocket.chat à partir d'un endpoint
     * @param endpointRaw Destination de l'API REST, comme "/login"
     */
    public static getREST_Endpoint(endpointRaw = ""): string {
        let endpoint = endpointRaw;
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        return this.getWebEndpoint(`/api/v1/${endpoint}`);
    }

    /**
     * Récupère l'URL Web Rocket.chat à partir d'un endpoint
     * @param endpointRaw Destination Web
     */
    public static getWebEndpoint(endpointRaw = ""): string {
        let endpoint = endpointRaw;
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        let resEndpoint = "" +
            `${process.env.ROCKETCHAT_REST_PROTOCOL}` +
            `://${process.env.ROCKETCHAT_ADDRESS}`;

        if (process.env.ROCKETCHAT_PORT) {
            resEndpoint += `:${process.env.ROCKETCHAT_PORT}`;
        }

        if (endpointRaw !== "") {
            resEndpoint += `/${endpoint}`;
        }

        return resEndpoint;
    }

    /**
     * Récupère l'URL de l'API WebSocket Rocket.chat à partir d'un endpoint
     * @param endpointRaw Destination de l'API WebSocket
     */
    public static getWebSocketEndpoint(endpointRaw = ""): string {
        let endpoint = endpointRaw;
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        let resEndpoint = "" +
            `${process.env.ROCKETCHAT_WEBSOCKET_PROTOCOL}` +
            `://${process.env.ROCKETCHAT_ADDRESS}`;

        if (process.env.ROCKETCHAT_PORT) {
            resEndpoint += `:${process.env.ROCKETCHAT_PORT}`;
        }

        return resEndpoint + `/websocket/${endpoint}`;
    }
}

export {RocketChat};
