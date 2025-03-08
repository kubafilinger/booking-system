import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TaskRepository } from '../repositories/task.repository';
import { ReservationProcessFailedEvent } from '../events/reservation-process-failed.event';

@EventsHandler(ReservationProcessFailedEvent)
export class ReservationProcessFailedHandler
  implements IEventHandler<ReservationProcessFailedEvent>
{
  constructor(
    @InjectPinoLogger(ReservationProcessFailedHandler.name)
    private readonly logger: PinoLogger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async handle(event: ReservationProcessFailedEvent): Promise<any> {
    this.logger.info(event, `Handle reservation process failed event`);

    await this.taskRepository.reportError(event);
  }
}
