import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProcessFileCommand } from '../commands/process-file.command';
import { ReservationRepository } from '../reservation.repository';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { ReservationDto } from '../dtos/reservation.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ReservationStatus } from '../models/reservation.types';
import { ReservationProcessFailedEvent } from 'src/modules/task/events/reservation-process-failed.event';

@CommandHandler(ProcessFileCommand)
export class ProcessFileHandler implements ICommandHandler<ProcessFileCommand> {
  constructor(
    @InjectPinoLogger(ProcessFileHandler.name)
    private readonly logger: PinoLogger,
    private readonly reservationRepository: ReservationRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ProcessFileCommand): Promise<any> {
    this.logger.info(command, `Handle process file command`);

    const { taskId, filePath } = command;

    const stream = fs.createReadStream(filePath);
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.read(stream);

    const sheet = workbook.worksheets[0];

    if (!sheet) {
      this.logger.trace(`File not found ${filePath}`);
      throw new Error(`File not found ${filePath}`);
    }

    const CHUNK_SIZE = 100;
    let reservations: ReservationDto[] = [];
    let isError: boolean = false;

    sheet.eachRow(async (row, rowNumber) => {
      if (rowNumber === 1) return;

      const reservationDto = plainToInstance(ReservationDto, {
        reservationId: row.getCell(1).value?.toString(),
        guestName: row.getCell(2).value,
        status: row.getCell(3).value?.toString(),
        checkInDate: new Date(row.getCell(4).value as string),
        checkOutDate: new Date(row.getCell(5).value as string),
      });

      const validationErrors = await validate(reservationDto);

      if (validationErrors.length) {
        const errors = validationErrors.map((err) =>
          Object.values(err.constraints || {}).join(', '),
        );

        this.logger.trace(
          errors,
          `Reservation ${reservationDto.reservationId} has errors`,
        );
        this.eventBus.publish(
          new ReservationProcessFailedEvent(
            taskId,
            reservationDto.reservationId ?? 'unknown',
            rowNumber,
            errors,
          ),
        );

        isError = true;
        return;
      }

      reservations.push(reservationDto);

      if (reservations.length >= CHUNK_SIZE) {
        await this.processChunk(reservations);
        reservations = [];
      }
    });

    if (reservations.length > 0) {
      await this.processChunk(reservations);
    }

    if (isError) {
      throw new Error('Completed with errors. Get report to see errors');
    }

  }

  private async processChunk(rows: ReservationDto[]) {
    this.logger.debug(`Process of ${rows.length} rows of reservations`);

    const promises = rows.map(
      async (row) => await this.processReservation(row),
    );

    await Promise.all(promises);
  }

  async processReservation(reservation: ReservationDto) {
    this.logger.trace(reservation, `Process reservation`);

    const existingReservation = await this.reservationRepository.findById(
      reservation.reservationId,
    );

    if (
      reservation.status === ReservationStatus.Canceled ||
      reservation.status === ReservationStatus.Completed
    ) {
      if (existingReservation) {
        await this.reservationRepository.updateStatus(
          existingReservation,
          reservation.status,
        );
      }
    } else {
      if (existingReservation) {
        await this.reservationRepository.update(reservation);
      } else {
        await this.reservationRepository.save(reservation);
      }
    }
  }
}
