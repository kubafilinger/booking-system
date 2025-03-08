import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ProcessFileCommand } from '../commands/process-file.command';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TaskStatusChangedEvent } from 'src/modules/task/events/task-status-changed.event';
import { TaskStatus } from 'src/modules/task/models/task.model';

@Processor('tasks')
export class TaskConsumer extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(TaskConsumer.name)
    private readonly logger: PinoLogger,
    private readonly eventBus: EventBus,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'task': {
        await this.processTask(job.data);
        return {};
      }
    }
  }

  async processTask(data: { taskId: string; filePath: string }) {
    const { taskId, filePath } = data;

    try {
      const command = new ProcessFileCommand(taskId, filePath);

      this.eventBus.publish(
        new TaskStatusChangedEvent(taskId, TaskStatus.InProgress),
      );

      await this.commandBus.execute(command);

      this.eventBus.publish(
        new TaskStatusChangedEvent(taskId, TaskStatus.Completed),
      );
    } catch (e) {
      this.logger.error(e);

      this.eventBus.publish(
        new TaskStatusChangedEvent(taskId, TaskStatus.Failed),
      );
    }
  }
}
