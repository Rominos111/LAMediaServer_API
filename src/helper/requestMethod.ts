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

/**
 * Détermine si un code HTTP est correct ou non
 * @param statusCode Code HTTP
 */
const isValidStatusCode = (statusCode: number): boolean => {
    return [200, 201, 204, 304].includes(statusCode);
}

export {RequestMethod, isValidStatusCode};
