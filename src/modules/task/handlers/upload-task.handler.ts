import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TaskRepository } from '../task.repository';
import { Task } from '../models/task.model';
import { extname } from 'path';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UploadTaskCommand } from '../commands/upload-task.command';

@CommandHandler(UploadTaskCommand)
export class UploadTaskHandler implements ICommandHandler<UploadTaskCommand> {
  constructor(
    @InjectQueue('tasks') private tasksQueue: Queue,
    @InjectPinoLogger(UploadTaskHandler.name)
    private readonly logger: PinoLogger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: UploadTaskCommand): Promise<any> {
    this.logger.info(command, `Handle upload task command`);

    const { file } = command;

    const task = Task.createForFile(file.path, extname(file.originalname));

    await this.taskRepository.save(task);

    this.logger.info(`Saved in the database with id "${task.id}"`);

    await this.tasksQueue.add('task', {
      taskId: task.id,
      filePath: file.path,
    }, {
      backoff: 3
    });

    return task.id;
  }
}
