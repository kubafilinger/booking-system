import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UploadTaskCommand } from './upload-task.command';
import { TaskRepository } from '../task.repository';

@CommandHandler(UploadTaskCommand)
export class UploadTaskHandler implements ICommandHandler<UploadTaskCommand> {
  constructor(
    @InjectPinoLogger(UploadTaskHandler.name)
    private readonly logger: PinoLogger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: UploadTaskCommand): Promise<any> {
    this.logger.debug(`Handle command: ${JSON.stringify(command)})`);

    const { file } = command;

    // TODO: file validation

    const taskId = await this.taskRepository.save(file.path);

    // TODO: send on queue

    return taskId;
  }
}
