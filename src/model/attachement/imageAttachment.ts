import {Attachment, AttachmentType} from ".";

interface ImageAttachmentSpecs {
    author_icon: string,
    image_url: string,
}

/**
 * Pièce-jointe image
 */
class ImageAttachment extends Attachment {
    /**
     * Lien de la preview
     * @private
     */
    private readonly _iconLink: string;

    /**
     * Lien de l'image
     * @private
     */
    private readonly _imageURL: string;

    public constructor(iconLink: string, imageURL: string) {
        super(AttachmentType.IMAGE);
        this._iconLink = iconLink;
        this._imageURL = imageURL;
    }

    public get iconLink(): string {
        return this._iconLink;
    }

    public get imageURL(): string {
        return this._imageURL;
    }

    public toJSON(): object {
        return {
            ...super.toJSON(),
            iconLink: this.iconLink,
            imageURL: this.imageURL,
        };
    }
}

export {ImageAttachment};
export type {ImageAttachmentSpecs};
