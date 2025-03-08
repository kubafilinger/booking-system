import { v4 as uuid } from 'uuid';

export enum TaskStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export class Task {
  constructor(
    public readonly id: string,
    public readonly filePath: string,
    public readonly status: TaskStatus,
  ) {}

  static createForFile(path: string, ext: string): Task {
    if (!['.xlsx'].includes(ext)) {
      throw new Error('Extension is not allowed. Only .xlsx files');
    }

    return new Task(uuid(), path, TaskStatus.Pending);
  }
}
