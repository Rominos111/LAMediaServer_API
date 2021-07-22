/**
 * Méthodes de requête
 */

/**
 * Méthodes de requête
 */
enum RequestMethod {
    /**
     * Supprime
     */
    DELETE = "DELETE",

    /**
     * Récupération, listing. Cacheable
     */
    GET = "GET",

    /**
     * Update, remplace partiellement
     */
    PATCH = "PATCH",

    /**
     * Crée
     */
    POST = "POST",

    /**
     * Update, remplace complètement
     */
    PUT = "PUT",
}

enum HTTPStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    CONFLICT = 409,
    GONE = 410,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
}

/**
 * Détermine si un code HTTP est correct ou non
 * @param statusCode Code HTTP
 */
const isValidStatusCode = (statusCode: number | HTTPStatus): boolean => {
    return [
        HTTPStatus.OK,
        HTTPStatus.CREATED,
        HTTPStatus.NO_CONTENT,
        HTTPStatus.NOT_MODIFIED,
    ].includes(statusCode);
};

export {
    HTTPStatus,
    isValidStatusCode,
    RequestMethod,
};
