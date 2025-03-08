import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskStatusQuery } from '../queries/get-task-status.query';
import { TaskRepository } from '../task.repository';
import { Task } from '../models/task.model';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@QueryHandler(GetTaskStatusQuery)
export class GetTaskStatusHandler implements IQueryHandler<GetTaskStatusQuery> {
  constructor(
    private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(GetTaskStatusHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetTaskStatusQuery): Promise<Task> {
    this.logger.info(query, `Handle get task status query`);

    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new Error('Not found');
    }

    return task;
  }
}
