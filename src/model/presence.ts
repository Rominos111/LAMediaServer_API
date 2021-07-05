/**
 * Statut de connexion
 */
enum Presence {
    AWAY = "away",
    BUSY = "busy",
    OFFLINE = "offline",
    ONLINE = "online",
    UNKNOWN = "unknown",
}

function presenceFromNumber(presenceAsNumber: number): Presence {
    switch (presenceAsNumber) {
        case 0:
            return Presence.OFFLINE;

        case 1:
            return Presence.ONLINE;

        case 2:
            return Presence.AWAY;

        case 3:
            return Presence.BUSY;

        default:
            console.warn("Invalid presence number:", presenceAsNumber);
            return Presence.UNKNOWN;
    }
}

export {
    Presence,
    presenceFromNumber,
};
