import {Presence} from "model/presence";
import {
    arrayToRole,
    Role,
} from "model/role";
import {
    RawFullUser,
    User,
} from "model/user";

interface EMail {
    address: string,
    verified: boolean,
}

interface RawCurrentUser extends RawFullUser {
    email: string,
    emails: EMail[],
    roles: string[],
    utcOffset: number,
}

class CurrentUser extends User {
    private readonly _email: string;
    private readonly _emails: EMail[];
    private readonly _utcTimezoneOffset: number;

    private constructor(id: string,
                        username: string,
                        name: string,
                        isMe: boolean,
                        roles: Role[],
                        status: Presence,
                        email: string,
                        emails: EMail[],
                        utcTimezoneOffset: number,
    ) {
        super(
            id,
            username,
            name,
            isMe,
            roles,
            status,
        );

        this._email = email;
        this._emails = emails;
        this._utcTimezoneOffset = utcTimezoneOffset;
    }

    public get email(): string {
        return this._email;
    }

    public get emails(): EMail[] {
        return this._emails;
    }

    public get utcTimezoneOffset(): number {
        return this._utcTimezoneOffset;
    }

    public static fromFullUser(rawUser: RawCurrentUser): CurrentUser {
        return new this(
            rawUser._id,
            rawUser.username,
            rawUser.name ? rawUser.name : rawUser.username,
            true,
            arrayToRole(rawUser.roles),
            Presence.UNKNOWN,
            rawUser.email,
            rawUser.emails,
            rawUser.utcOffset,
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            ...super.toJSON(),
            email: this.email,
            emails: this.emails,
            utcTimezoneOffset: this.utcTimezoneOffset,
        };
    }
}

export {CurrentUser};
export type {RawCurrentUser};
