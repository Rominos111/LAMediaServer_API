enum Role {
    ADMIN = "admin",
    BOT = "bot",
    OWNER = "owner",
    STUDENT = "student",
    TEACHER = "teacher",
    UNKNOWN = "unknown",
}

function stringToRole(rawRole: string): Role {
    switch (rawRole.toLowerCase()) {
        case "admin":
            return Role.ADMIN;

        case "bot":
            return Role.BOT;

        case "owner":
            return Role.OWNER;

        case "student":
        case "user":
            return Role.STUDENT;

        case "teacher":
            return Role.TEACHER;

        default:
            return Role.UNKNOWN;
    }
}

function arrayToRole(rawRoles: string[]): Role[] {
    const roles = [] as Role[];
    for (const rawRole of rawRoles) {
        roles.push(stringToRole(rawRole));
    }
    return roles;
}

export {
    Role,
    arrayToRole,
    stringToRole,
};
