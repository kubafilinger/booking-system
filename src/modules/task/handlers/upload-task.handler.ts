import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UploadTaskCommand } from './upload-task.command';
import { TaskRepository } from '../task.repository';
import { Task } from '../models/task.model';
import { extname } from 'path';

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

    const task = Task.createForFile(file.path, extname(file.originalname));

    await this.taskRepository.save(task);

    // TODO: send on queue

    return task.getId();
  }
}
