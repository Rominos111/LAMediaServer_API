export default class RocketChat {
    static getAPIUrl(endpoint: string = ""): string {
        if (endpoint.startsWith("/")) {
            endpoint = endpoint.substr(1);
        }

        return `http://${process.env.ROCKETCHAT_ADDRESS}:${process.env.ROCKETCHAT_PORT}/api/v1/${endpoint}`;
    }
}
