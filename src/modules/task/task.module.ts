import { Module } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { TaskController } from './task.controller';
import { UploadTaskHandler } from './handlers/upload-task.handler';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModel, TaskSchema } from './models/task.schema';
import { GetTaskStatusHandler } from './handlers/get-task-status.handler';
import { BullModule } from '@nestjs/bullmq';
import { TaskStatusChangedHandler } from './handlers/task-status-changed.handler';

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
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskRepository, UploadTaskHandler, GetTaskStatusHandler, TaskStatusChangedHandler],
})
export class TaskModule {}
