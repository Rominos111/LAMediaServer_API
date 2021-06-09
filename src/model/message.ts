import User from "model/user";

/**
 * Message
 */
export default class Message {
    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Contenu
     * @private
     */
    private readonly _content: string;

    /**
     * Utilisateur parent
     * @private
     */
    private readonly _parentUser: User;

    public constructor(id, content, parentUser) {
        this._id = id;
        this._content = content;
        this._parentUser = parentUser;
    }

    public get id() {
        return this._id;
    }

    public get content() {
        return this._content;
    }

    public get parentUser() {
        return this._parentUser;
    }

    public static fromObject(obj: any | undefined): Message | null {
        if (obj === undefined) {
            return null;
        } else {
            return new Message(obj._id, obj.msg, User.fromPartialUser(obj.u._id, obj.u.username, obj.u.name));
        }
    }

    public toJSON(): Object {
        return {
            id: this.id,
            content: this.content,
            parentUser: this.parentUser,
        }
    }
}
