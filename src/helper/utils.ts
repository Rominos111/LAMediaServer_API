/**
 * Attend un certain temps
 * @param ms Temps en ms
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ID aléatoire sous la forme "0123-4567-89ab"
 * @param blocks Nombre de blocs
 * @param blockLength Taille d'un bloc
 * @param sep Séparateur
 */
function randomUID(blocks: number = 8, blockLength: number = 4, sep: string = "-"): string {
    let uid = "";
    for (let i = 0; i < blocks; ++i) {
        for (let j = 0; j < blockLength; ++j) {
            uid += Math.floor(Math.random() * 16).toString(16);
        }

        uid += sep;
    }

    if (sep === "") {
        return uid;
    } else {
        return uid.slice(0, -sep.length);
    }
}

/**
 * Chaine aléatoire
 * @param length Taille de la chaine
 */
function randomString(length: number = 16): string {
    return randomUID(1, length);
}

export {
    sleep,
    randomString,
    randomUID,
};
