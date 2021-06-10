import {Attachment, AttachmentType} from ".";

/**
 * Pièce-jointe image
 */
export class ImageAttachment extends Attachment {
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

    public toJSON(): Object {
        return {
            ...super.toJSON(),
            iconLink: this.iconLink,
            imageURL: this.imageURL,
        };
    }
}
