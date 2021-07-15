import {Serializable} from "helper/serializable";

interface RawReaction {
    [reaction: string]: {
        usernames: string[],
    },
}

/**
 * Réaction
 */
class Reaction implements Serializable {
    /**
     * Réaction
     * @private
     */
    private readonly _reaction: string;

    /**
     * Utilisateurs
     * @private
     */
    private readonly _usernames: string[];

    constructor(reaction: string, usernames: string[]) {
        this._reaction = reaction;
        this._usernames = usernames;
    }

    public get reaction(): string {
        return this._reaction;
    }

    public get usernames(): string[] {
        return this._usernames;
    }

    public static fromArray(obj: RawReaction[]): Reaction[] {
        const reactions: Reaction[] = [];

        for (const reaction of Object.keys(obj)) {
            reactions.push(new Reaction(reaction, obj[reaction].usernames));
        }

        return reactions;
    }

    public toJSON(): Record<string, unknown> {
        return {
            reaction: this.reaction,
            usernames: this.usernames,
        };
    }
}

export {Reaction};
export type {RawReaction};
