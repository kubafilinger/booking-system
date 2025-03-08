import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskStatus } from '../models/task.model';
import { TaskModel } from '../models/task.schema';
import { Model } from 'mongoose';
import { ReportModel } from '../models/report.schema';
import { Report } from '../models/report.types';

export class TaskRepository {
  constructor(
    @InjectModel(TaskModel.name) private taskModel: Model<TaskModel>,
    @InjectModel(ReportModel.name) private reportModel: Model<ReportModel>,
  ) {}

  async save(task: Task) {
    await this.taskModel.create(task);
  }

  async update(taskId: string, status: TaskStatus) {
    await this.taskModel.updateOne({ id: taskId }, { status });
  }

  async findById(taskId: string): Promise<Task | null> {
    const taskFromDb = await this.taskModel.findOne({ id: taskId }).exec();

    if (!taskFromDb) {
      return null;
    }

    return new Task(taskFromDb.id, taskFromDb.filePath, taskFromDb.status);
  }

  async getTaskReports(taskId: string): Promise<Report[]> {
    return (await this.reportModel.find({ taskId }).exec()).map((report) => ({
      taskId: report.taskId,
      reservationId: report.reservationId,
      row: report.row,
      errors: report.errors,
    }));
  }

  async reportError(report: Report) {
    await this.reportModel.create(report);
  }
}
