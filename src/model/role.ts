import {Serializable} from "helper/serializable";

enum RoleScope {
    USERS = "Users",
    SUBSCRIPTIONS = "Subscriptions",
}

interface RawRole {
    _id: string,
    description: string,
    name: string,
    protected: boolean,
    scope: string | RoleScope,
}

class Role implements Serializable {
    private readonly _description: string;
    private readonly _id: string;
    private readonly _name: string;
    private readonly _protection: boolean;

    private constructor(id: string,
                        description: string,
                        name: string,
                        protection: boolean,
    ) {
        this._id = id;
        this._description = description;
        this._name = name;
        this._protection = protection;
    }

    public get description(): string {
        return this._description;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get protection(): boolean {
        return this._protection;
    }

    public static fromObject(rawRole: RawRole): Role | null {
        if (rawRole.scope === RoleScope.USERS) {
            return new this(
                rawRole._id,
                rawRole.description,
                rawRole.name,
                rawRole.protected,
            );
        } else {
            return null;
        }
    }

    public static fromString(rawRole: string): Role {
        return this.fromObject({
            _id: rawRole,
            description: rawRole,
            name: rawRole,
            protected: true,
            scope: RoleScope.USERS,
        }) as Role;
    }

    public static fromObjectArray(rawRoles: RawRole[]): Role[] {
        const roles: Role[] = [];
        for (const rawRole of rawRoles) {
            const role = this.fromObject(rawRole);
            if (role !== null) {
                roles.push(role);
            }
        }
        return roles;
    }

    public static fromStringArray(rawRoles: string[]): Role[] {
        const roles: Role[] = [];
        for (const rawRole of rawRoles) {
            roles.push(this.fromString(rawRole));
        }
        return roles;
    }

    public toJSON(): Record<string, unknown> {
        return {
            description: this.description,
            id: this.id,
            name: this.name,
            protected: this.protection,
        };
    }
}

export {Role};
export type {RawRole};
