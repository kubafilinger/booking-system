import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaskRepository } from '../repositories/task.repository';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { GetTaskReportQuery } from '../queries/get-task-report.query';
import { Report } from '../models/report.types';

@QueryHandler(GetTaskReportQuery)
export class GetTaskReportHandler implements IQueryHandler<GetTaskReportQuery> {
  constructor(
    private readonly taskRepository: TaskRepository,
    @InjectPinoLogger(GetTaskReportHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetTaskReportQuery): Promise<Report[]> {
    this.logger.info(query, `Handle get task report query`);

    return await this.taskRepository.getTaskReports(query.taskId);
  }
}
