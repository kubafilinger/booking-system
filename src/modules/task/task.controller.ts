import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
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
import * as fs from 'fs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetTaskStatusDto } from './query-params/get-task-status.dto';
import { GetTaskStatusQuery } from './queries/get-task-status.query';
import { UploadTaskCommand } from './commands/upload-task.command';
import { GetTaskReportDto } from './query-params/get-task-report.dto';
import { GetTaskReportQuery } from './queries/get-task-report.query';
import { ValidationError } from 'src/common/errors/validation.error';
import { Report } from './models/report.types';

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
      try {
        await fs.unlinkSync(file.path);
      } catch (error) {
        this.logger.error(error, `Error when removing file ${file.path}`);
        
        throw new InternalServerErrorException('Something went wrong');
      }

      if (e instanceof ValidationError) {
        this.logger.info(e.message);

        throw new BadRequestException(e.message);
      }

      this.logger.error(e.message);

      throw new InternalServerErrorException('Something went wrong');
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
      if (e instanceof NotFoundException) {
        this.logger.info(e.message);

        throw e;
      }

      this.logger.error(e.message);

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @Get('report/:id')
  async getTaskReport(@Param() { id }: GetTaskReportDto, @Res() res: Response) {
    try {
      const query = new GetTaskReportQuery(id);
      const reports = await this.queryBus.execute(query);
      const response: Report[] = reports.map((report) => ({
        reservationId: report.reservationId,
        row: report.row,
        errors: report.errors,
      }));

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      if (e instanceof NotFoundException) {
        this.logger.info(e.message);

        throw e;
      }

      this.logger.error(e.message);

      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
