import {Attachment} from "model/attachement";
import {Reaction} from "model/reaction";
import {User} from "model/user";

interface PartialMessageSpecs {
    _id: string,
    msg: string,
    u: {
        _id: string,
        username: string,
        name: string | undefined,
    },
}

/**
 * Message raw
 */
interface RawMessage extends PartialMessageSpecs {
    md: unknown, // TODO: gérer ce `md` ?
    rid: string,
    ts: Date | string | number,
    attachments: object[] | undefined,
    reactions: object[] | undefined,
}

/**
 * Message
 */
class Message {
    /**
     * Liste des pièces jointes
     * @private
     */
    private readonly _attachments: Attachment[] | undefined;

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
    private readonly _reactions: Reaction[] | undefined;

    /**
     * ID de la salle
     * @private
     */
    private readonly _roomId: string | undefined;

    /**
     * Timestamp
     * @private
     */
    private readonly _timestamp: Date | undefined;

    private constructor(id: string,
                        content: string,
                        parentUser: User,
                        roomId: string | undefined,
                        timestamp: Date | undefined,
                        attachments: Attachment[] | undefined,
                        reactions: Reaction[] | undefined,
    ) {
        this._id = id;
        this._content = content;
        this._parentUser = parentUser;
        this._roomId = roomId;
        this._timestamp = timestamp;
        this._attachments = attachments;
        this._reactions = reactions;
    }

    public get attachments(): Attachment[] | undefined {
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

    public get reactions(): Reaction[] | undefined {
        return this._reactions;
    }

    public get roomId(): string | undefined {
        return this._roomId;
    }

    public get timestamp(): Date | undefined {
        return this._timestamp;
    }

    /**
     * Depuis un message complet
     * @param rawMessage Message
     * @param currentUserID ID de l'utilisateur courant, pour savoir si ce message vient de l'utilisateur connecté
     */
    public static fromFullMessage(rawMessage: RawMessage, currentUserID: string): Message {
        return new this(
            rawMessage._id,
            rawMessage.msg,
            User.fromPartialUser(
                rawMessage.u._id,
                rawMessage.u.username,
                rawMessage.u.name,
                rawMessage.u._id === currentUserID,
            ),
            rawMessage.rid,
            new Date(rawMessage.ts),
            Attachment.fromArray(rawMessage.attachments),
            Reaction.fromObject(rawMessage.reactions),
        );
    }

    /**
     * Depuis un message partiel
     * @param rawMessage Message
     * @param userID ID de l'utilisateur courant
     */
    public static fromPartialMessage(rawMessage: object | undefined, userID: string): Message | undefined {
        if (rawMessage === undefined || rawMessage.hasOwnProperty("msg")) {
            // FIXME: Gérer les cas où le dernier message est une réaction
            return undefined;
        } else {
            const partialMessage = rawMessage as PartialMessageSpecs;
            return new this(
                partialMessage._id,
                partialMessage.msg,
                User.fromPartialUser(
                    partialMessage.u._id,
                    partialMessage.u.username,
                    partialMessage.u.name,
                    partialMessage.u._id === userID,
                ),
                undefined,
                undefined,
                undefined,
                undefined,
            );
        }
    }

    public toJSON(): object {
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
export type {RawMessage};
