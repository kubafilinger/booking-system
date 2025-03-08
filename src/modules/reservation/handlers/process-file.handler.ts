import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProcessFileCommand } from '../commands/process-file.command';
import { ReservationRepository } from '../reservation.repository';
import * as Xlsx from 'xlsx';
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

    const fileBuffer = await fs.promises.readFile(filePath); // TODO: change it on chunks
    const workbook = Xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      this.logger.trace(`File not found ${filePath}`);
      throw new Error(`File not found ${filePath}`);
    }

    const CHUNK_SIZE = 100;
    let rows: ReservationDto[] = [];
    let rowIndex = 2;

    const range = Xlsx.utils.decode_range(sheet['!ref'] || '');

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      const rowData = {};

      for (let cell = range.s.c; cell <= range.e.c; cell++) {
        const cellRef = Xlsx.utils.encode_cell({ r: row, c: cell });

        rowData[cell] = sheet[cellRef] ? sheet[cellRef].v : null;
      }
      const [reservation, errors] = await this.createAndValidateDto(rowData);

      if (errors.length) {
        this.logger.trace(
          errors,
          `Reservation ${reservation.reservationId} has errors`,
        );
        this.eventBus.publish(
          new ReservationProcessFailedEvent(
            taskId,
            reservation.reservationId,
            rowIndex,
            errors,
          ),
        );

        rowIndex++;
        continue;
      }

      rows.push(reservation);

      if (rows.length >= CHUNK_SIZE) {
        await this.processChunk(rows);
        rows = [];
      }
      rowIndex++;
    }

    if (rows.length > 0) {
      await this.processChunk(rows);
    }
  }

  private async createAndValidateDto(
    rowData,
  ): Promise<[ReservationDto, string[]]> {
    const reservationDto = plainToInstance(ReservationDto, {
      reservationId: rowData[0]?.toString(),
      guestName: rowData[1],
      status: rowData[2]?.toLowerCase(),
      checkInDate: new Date(rowData[3]),
      checkOutDate: new Date(rowData[4]),
    });

    const errors: string[] = [];

    const validationErrors = await validate(reservationDto);

    if (validationErrors.length > 0) {
      validationErrors.forEach((err) =>
        errors.push(Object.values(err.constraints || {}).join(', ')),
      );
    }

    return [reservationDto, errors];
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
