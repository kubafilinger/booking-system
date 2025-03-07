import { Module } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { TaskController } from './task.controller';
import { UploadTaskHandler } from './handlers/upload-task.handler';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [TaskRepository, UploadTaskHandler],
})
export class TaskModule {}
