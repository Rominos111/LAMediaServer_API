import Attachment from "model/attachement";
import Reaction from "model/reaction";
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
    private readonly _roomId: string | undefined;
    private readonly _timestamp: Date | undefined;
    private readonly _attachments: Attachment[] | undefined;
    private readonly _reactions: Reaction[] | undefined;

    private constructor(id: string,
                        content: string,
                        parentUser: User,
                        roomId: string | undefined,
                        timestamp: Date | undefined,
                        attachments: Attachment[] | undefined,
                        reactions: Reaction[] | undefined
    ) {
        this._id = id;
        this._content = content;
        this._parentUser = parentUser;
        this._roomId = roomId;
        this._timestamp = timestamp;
        this._attachments = attachments;
        this._reactions = reactions;
    }

    public get reactions(): Reaction[] | undefined {
        return this._reactions;
    }

    public get roomId(): string | undefined {
        return this._roomId;
    }

    public get timestamp(): Date | undefined {
        return this._timestamp;
    }

    public get attachments(): Attachment[] | undefined {
        return this._attachments;
    }

    public get id(): string {
        return this._id;
    }

    public get content(): string {
        return this._content;
    }

    public get parentUser(): User {
        return this._parentUser;
    }

    public static fromFullMessage(id: string,
                                  content: string,
                                  parentUser: User,
                                  roomId: string,
                                  timestamp: Date,
                                  attachments: Attachment[] | undefined,
                                  reactions: Reaction[] | undefined
    ): Message {
        return new this(id, content, parentUser, roomId, timestamp, attachments, reactions);
    }

    public static fromObject(obj: any | undefined): Message | undefined {
        if (obj === undefined) {
            return undefined;
        } else {
            return new this(
                obj._id,
                obj.msg,
                User.fromPartialUser(obj.u._id, obj.u.username, obj.u.name),
                undefined,
                undefined,
                undefined,
                undefined
            );
        }
    }

    public toJSON(): Object {
        return {
            id: this.id,
            content: this.content,
            parentUser: this.parentUser,
            roomId: this.roomId,
            timestamp: this.timestamp,
            attachments: this.attachments,
            reactions: this.reactions,
        }
    }
}
