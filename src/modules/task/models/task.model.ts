import { v4 as uuid } from 'uuid';

export enum TaskStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export class Task {
  constructor(
    private readonly id: string,
    private readonly filePath: string,
    private readonly status: TaskStatus,
  ) {}

  static createForFile(path: string, ext: string): Task {
    console.log(ext);
    if (!['.xlsx'].includes(ext)) {
      throw new Error('Extension is not allowed. Only .xlsx files');
    }

    return new Task(uuid(), path, TaskStatus.Pending);
  }

  getId(): string {
    return this.id;
  }
}
