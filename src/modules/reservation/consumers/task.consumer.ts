import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ProcessFileCommand } from '../commands/process-file.command';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Processor('tasks')
export class TaskConsumer extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(TaskConsumer.name)
    private readonly logger: PinoLogger,
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
    try {
      const command = new ProcessFileCommand(data.taskId, data.filePath);
      // TODO: update task satttus na in progress
      await this.commandBus.execute(command);
      // todo update task status na completed
    } catch (e) {
      this.logger.error(e);
      // TODO: throw error or what?
      //todo: update task stataus na failed
    }
  }
}
