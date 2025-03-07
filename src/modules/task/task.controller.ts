import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { v1 as uuid } from 'uuid';
import { extname } from 'path';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UploadTaskCommand } from './handlers/upload-task.command';
import { GetTaskStatusDto } from './query-params/get-task-status.dto';
import { GetTaskStatusQuery } from './queries/get-task-status.query';

@Controller('tasks')
export class TaskController {
  constructor(
    @InjectPinoLogger(TaskController.name)
    private readonly logger: PinoLogger,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads');
        },
        filename: (req, file, cb) => {
          const fileExt = extname(file.originalname);
          cb(null, `reservation-${uuid()}${fileExt}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    try {
      const command = new UploadTaskCommand(file);

      return response.status(HttpStatus.CREATED).json({
        taskId: await this.commandBus.execute(command),
      });
    } catch (e) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: {
          message: e.message,
        },
      });
    }
  }

  @Get('status/:id')
  async getTaskStatus(
    @Param() { id }: GetTaskStatusDto,
    @Res() response: Response,
  ) {
    try {
      const query = new GetTaskStatusQuery(id);

      return response
        .status(HttpStatus.OK)
        .json(await this.queryBus.execute(query));
    } catch (e) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: {
          message: e.message,
        },
      });
    }
  }
}
