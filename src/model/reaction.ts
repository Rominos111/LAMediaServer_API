export default class Reaction {
    private readonly _reaction: string;
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

    public static fromObject(obj: any | undefined): Reaction[] | undefined {
        if (obj === undefined) {
            return undefined;
        } else {
            let reactions: Reaction[] = [];

            for (const reaction of Object.keys(obj)) {
                reactions.push(new Reaction(reaction, obj[reaction].usernames));
            }

            return reactions;
        }
    }

    public toJSON(): Object {
        return {
            reaction: this.reaction,
            usernames: this.usernames,
        }
    }
}
