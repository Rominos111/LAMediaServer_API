/**
 * Permet de régler des problèmes d'imports cycliques
 */

export {Attachment, AttachmentType} from "./attachment";
export {FileAttachment} from "./fileAttachment";
export {ImageAttachment} from "./imageAttachment";

import {Attachment} from "model/attachement/attachment";
export default Attachment;
