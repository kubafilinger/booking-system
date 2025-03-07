import { InjectModel } from '@nestjs/mongoose';
import { Task } from './models/task.model';
import { TaskModel } from './models/task.schema';
import { Model } from 'mongoose';

export class TaskRepository {
  constructor(
    @InjectModel(TaskModel.name) private taskModel: Model<TaskModel>,
  ) {}

  async save(task: Task) {
    await this.taskModel.create(task);
  }

  async findById(taskId: string): Promise<Task | null> {
    const taskFromDb = await this.taskModel.findOne({ id: taskId }).exec();

    if (!taskFromDb) {
      return null;
    }

    return new Task(taskFromDb.id, taskFromDb.filePath, taskFromDb.status);
  }
}
