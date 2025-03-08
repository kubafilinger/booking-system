import { TaskStatus } from '../models/task.model';

export class TaskStatusChangedEvent {
  constructor(
    public readonly taskId: string,
    public readonly status: TaskStatus,
  ) {}
}
