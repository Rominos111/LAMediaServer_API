import {Attachment, AttachmentType} from ".";

export class FileAttachment extends Attachment {
    private readonly _fileLink: string;
    private readonly _isDownloadable: boolean;

    constructor(fileLink: string, isDownloadable: boolean) {
        super(AttachmentType.FILE);
        this._fileLink = fileLink;
        this._isDownloadable = isDownloadable;
    }

    public get fileLink(): string {
        return this._fileLink;
    }

    public get isDownloadable(): boolean {
        return this._isDownloadable;
    }

    public toJSON(): Object {
        return {
            ...super.toJSON(),
            fileLink: this.fileLink,
            isDownloadable: this.isDownloadable,
        };
    }
}
