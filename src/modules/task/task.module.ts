import { Module } from '@nestjs/common';
import { TaskRepository } from './repositories/task.repository';
import { TaskController } from './task.controller';
import { UploadTaskHandler } from './handlers/upload-task.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModel, TaskSchema } from './models/task.schema';
import { GetTaskStatusHandler } from './handlers/get-task-status.handler';
import { BullModule } from '@nestjs/bullmq';
import { TaskStatusChangedHandler } from './handlers/task-status-changed.handler';
import { ReportModel, ReportSchema } from './models/report.schema';
import { ReservationProcessFailedHandler } from './handlers/reservation-process-failed.handler';
import { GetTaskReportHandler } from './handlers/get-task-report.handler';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tasks',
    }),
    MongooseModule.forFeature([
      {
        name: TaskModel.name,
        schema: TaskSchema,
      },
      {
        name: ReportModel.name,
        schema: ReportSchema,
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [
    TaskRepository,
    UploadTaskHandler,
    GetTaskStatusHandler,
    GetTaskReportHandler,
    TaskStatusChangedHandler,
    ReservationProcessFailedHandler,
  ],
})
export class TaskModule {}
