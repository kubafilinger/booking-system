export class ProcessFileCommand {
  constructor(
    public readonly taskId: string,
    public readonly filePath: string,
  ) {}
}
