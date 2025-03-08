import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TaskRepository } from '../task.repository';
import { TaskStatusChangedEvent } from '../events/task-status-changed.event';

@EventsHandler(TaskStatusChangedEvent)
export class TaskStatusChangedHandler implements IEventHandler<TaskStatusChangedEvent> {
  constructor(
    @InjectPinoLogger(TaskStatusChangedHandler.name)
    private readonly logger: PinoLogger,
    private readonly taskRepository: TaskRepository
  ) {}

  async handle(event: TaskStatusChangedEvent): Promise<any> {
    this.logger.info(event, `Handle update task status event`);

    await this.taskRepository.update(event.taskId, event.status)
  }
}
