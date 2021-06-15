import {FileAttachment, ImageAttachment} from ".";
import {ImageAttachmentSpecs} from "./imageAttachment";
import {FileAttachmentSpecs} from "./fileAttachment";

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

    public static fromArray(rawAttachments: object[] | undefined): Attachment[] | undefined {
        if (rawAttachments === undefined) {
            return undefined;
        } else {
            let attachments: Attachment[] = [];

            for (const rawAttachment of rawAttachments) {
                if (rawAttachment.hasOwnProperty("image_url")) {
                    const imageAttachment = rawAttachment as ImageAttachmentSpecs;
                    attachments.push(new ImageAttachment(imageAttachment.author_icon, imageAttachment.image_url));
                } else {
                    const fileAttachment = rawAttachment as FileAttachmentSpecs;
                    attachments.push(new FileAttachment(fileAttachment.title_link, fileAttachment.title_link_download));
                }
            }

            return attachments;
        }
    }

    public toJSON(): object {
        return {
            type: this.type,
        };
    }
}

export {Attachment, AttachmentType};
