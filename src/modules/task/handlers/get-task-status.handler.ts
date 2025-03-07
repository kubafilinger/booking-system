import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskStatusQuery } from '../queries/get-task-status.query';
import { TaskRepository } from '../task.repository';
import { Task } from '../models/task.model';

@QueryHandler(GetTaskStatusQuery)
export class GetTaskStatusHandler implements IQueryHandler<GetTaskStatusQuery> {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTaskStatusQuery): Promise<Task> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new Error('Not found');
    }

    return task;
  }
}
