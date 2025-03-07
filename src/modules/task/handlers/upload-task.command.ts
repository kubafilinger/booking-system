export class UploadTaskCommand {
  constructor(public readonly file: Express.Multer.File) {}
}
