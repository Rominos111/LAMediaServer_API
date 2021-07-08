import {Attachment} from "model/attachement";
import {RawFileAttachment} from "model/attachement/fileAttachment";
import {RawImageAttachment} from "model/attachement/imageAttachment";
import {
    RawReaction,
    Reaction,
} from "model/reaction";
import {
    RawPartialUser,
    User,
} from "model/user";

interface RawPartialMessage {
    _id: string,
    msg: string,
    u: RawPartialUser,
}

/**
 * Message raw
 */
interface RawFullMessage extends RawPartialMessage {
    md: unknown, // TODO: gérer ce `md` ?
    rid: string,
    ts: Date | string | number,
    attachments?: (RawImageAttachment | RawFileAttachment)[],
    reactions?: RawReaction[],
}

/**
 * Message
 */
class Message {
    /**
     * Liste des pièces jointes
     * @private
     */
    private readonly _attachments: Attachment[] | null;

    /**
     * Contenu
     * @private
     */
    private readonly _content: string;

    /**
     * ID
     * @private
     */
    private readonly _id: string;

    /**
     * Utilisateur parent
     * @private
     */
    private readonly _parentUser: User;

    /**
     * Liste des réactions
     * @private
     */
    private readonly _reactions: Reaction[] | null;

    /**
     * ID de la salle
     * @private
     */
    private readonly _roomId: string | null;

    /**
     * Timestamp
     * @private
     */
    private readonly _timestamp: Date | null;

    private constructor(id: string,
                        content: string,
                        parentUser: User,
                        roomId: string | null,
                        timestamp: Date | null,
                        attachments: Attachment[] | null,
                        reactions: Reaction[] | null,
    ) {
        this._id = id;
        this._content = content;
        this._parentUser = parentUser;
        this._roomId = roomId;
        this._timestamp = timestamp;
        this._attachments = attachments;
        this._reactions = reactions;
    }

    public get attachments(): Attachment[] | null {
        return this._attachments;
    }

    public get content(): string {
        return this._content;
    }

    public get id(): string {
        return this._id;
    }

    public get parentUser(): User {
        return this._parentUser;
    }

    public get reactions(): Reaction[] | null {
        return this._reactions;
    }

    public get roomId(): string | null {
        return this._roomId;
    }

    public get timestamp(): Date | null {
        return this._timestamp;
    }

    /**
     * Depuis un message complet
     * @param rawMessage Message
     * @param currentUserID ID de l'utilisateur courant, pour savoir si ce message vient de l'utilisateur connecté
     */
    public static fromFullMessage(rawMessage: RawFullMessage, currentUserID: string): Message {
        return new this(
            rawMessage._id,
            rawMessage.msg,
            User.fromPartialUser(rawMessage.u, currentUserID),
            rawMessage.rid,
            new Date(rawMessage.ts),
            rawMessage.attachments ? Attachment.fromArray(rawMessage.attachments) : null,
            rawMessage.reactions ? Reaction.fromArray(rawMessage.reactions) : null,
        );
    }

    public toJSON(): Record<string, unknown> {
        return {
            attachments: this.attachments,
            content: this.content,
            id: this.id,
            parentUser: this.parentUser,
            reactions: this.reactions,
            roomId: this.roomId,
            timestamp: this.timestamp,
        };
    }
}

export {Message};
export type {RawFullMessage};
