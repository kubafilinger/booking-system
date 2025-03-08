import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskStatusQuery } from '../queries/get-task-status.query';
import { TaskRepository } from '../repositories/task.repository';
import { Task } from '../models/task.model';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetTaskStatusQuery)
export class GetTaskStatusHandler implements IQueryHandler<GetTaskStatusQuery> {
  constructor(
    private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(GetTaskStatusHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetTaskStatusQuery): Promise<Task> {
    this.logger.info(query, `Handle get task status query`);

    const { taskId } = query;
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException(`Not found task with id: "${taskId}"`);
    }

    return task;
  }
}
