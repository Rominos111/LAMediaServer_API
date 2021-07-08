/**
 * Informations relatives à OpenVidu
 */

import {RequestMethod} from "helper/requestMethod";
import {RequestOptions} from "https";

/**
 * Informations relatives à OpenVidu
 */
abstract class OpenVidu {
    public static getWebEndpoint(endpointRaw = ""): string {
        let endpoint = endpointRaw;
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        let resEndpoint = "" +
            `${process.env.OPENVIDU_HTTP_PROTOCOL}` +
            `://${process.env.OPENVIDU_ADDRESS}`;

        if (process.env.OPENVIDU_PORT) {
            resEndpoint += `:${process.env.OPENVIDU_PORT}`;
        }

        if (endpointRaw !== "") {
            resEndpoint += `/${endpoint}`;
        }

        return resEndpoint;
    }

    public static getWebSocketEndpoint(endpointRaw = ""): string {
        let endpoint = endpointRaw;
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        let resEndpoint = "" +
            `${process.env.OPENVIDU_WEBSOCKET_PROTOCOL}` +
            `://${process.env.OPENVIDU_ADDRESS}`;

        if (process.env.ROCKETCHAT_PORT) {
            resEndpoint += `:${process.env.OPENVIDU_PORT}`;
        }

        return resEndpoint + `/openvidu/${endpoint}`;
    }

    /**
     * Construit les options HTTPS utilisées par OpenVidu
     * @param method Méthode HTTP de requête
     * @param path Chemin OpenVidu
     */
    public static getOptions(method: RequestMethod | string, path: string): RequestOptions {
        let opt: RequestOptions = {
            hostname: `${process.env.OPENVIDU_ADDRESS}`,
            path,
            method,
            headers: {
                authorization: "Basic " + Buffer.from("OPENVIDUAPP:" + process.env.OPENVIDU_SECRET).toString("base64"),
                "content-type": "application/json",
            },
            rejectUnauthorized: false,
            // requestCert: true,
            agent: false,
        };

        if (process.env.OPENVIDU_PORT) {
            opt.port = process.env.OPENVIDU_PORT;
        }

        return opt;
    }
}

export {OpenVidu};
