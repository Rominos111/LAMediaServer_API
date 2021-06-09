import {FileAttachment, ImageAttachment} from ".";

enum AttachmentType {
    FILE = "file",
    IMAGE = "image",
}

abstract class Attachment {
    private readonly _type: AttachmentType;

    protected constructor(type: AttachmentType) {
        this._type = type;
    }

    public get type(): AttachmentType {
        return this._type;
    }

    public static fromArray(rawAttachments: any[]): Attachment[] | undefined {
        if (rawAttachments === undefined) {
            return undefined;
        } else {
            let attachments: Attachment[] = [];

            for (let rawAttachment of rawAttachments) {
                if (rawAttachment.image_url !== undefined) {
                    attachments.push(new ImageAttachment(rawAttachment.author_icon, rawAttachment.image_url));
                } else {
                    attachments.push(new FileAttachment(rawAttachment.title_link, rawAttachment.title_link_download));
                }
            }

            return attachments;
        }
    }

    public toJSON(): Object {
        return {
            type: this.type
        };
    }
}

export {Attachment, AttachmentType};
