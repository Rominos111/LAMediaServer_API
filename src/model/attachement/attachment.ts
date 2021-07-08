import {
    FileAttachment,
    ImageAttachment,
} from ".";
import {RawFileAttachment} from "./fileAttachment";
import {RawImageAttachment} from "./imageAttachment";

/**
 * Type de pièce-jointe
 */
enum AttachmentType {
    FILE = "file",
    IMAGE = "image",
}

/**
 * Pièce-jointe
 */
abstract class Attachment {
    /**
     * Type de pièce-jointe
     * @private
     */
    private readonly _type: AttachmentType;

    protected constructor(type: AttachmentType) {
        this._type = type;
    }

    public get type(): AttachmentType {
        return this._type;
    }

    public static fromArray(rawAttachments: (RawImageAttachment | RawFileAttachment)[]): Attachment[] {
        const attachments: Attachment[] = [];

        for (const rawAttachment of rawAttachments) {
            if (rawAttachment.hasOwnProperty("image_url")) {
                const imageAttachment = rawAttachment as RawImageAttachment;
                attachments.push(new ImageAttachment(imageAttachment.author_icon, imageAttachment.image_url));
            } else {
                const fileAttachment = rawAttachment as RawFileAttachment;
                attachments.push(new FileAttachment(fileAttachment.title_link, fileAttachment.title_link_download));
            }
        }

        return attachments;
    }

    public toJSON(): Record<string, unknown> {
        return {
            type: this.type,
        };
    }
}

export {
    Attachment,
    AttachmentType,
};
