import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TaskStatus } from './task.model';

export type TaskDocument = HydratedDocument<TaskModel>;

@Schema()
export class TaskModel {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, unique: true })
  filePath: string;

  @Prop({
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  })
  status: TaskStatus;

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(TaskModel);
