import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus } from '../models/reservation.model';

export class ReservationDto {
  @IsNumberString()
  @IsNotEmpty()
  reservationId: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @IsDate()
  @Type(() => Date)
  checkInDate: Date;

  @IsDate()
  @Type(() => Date)
  checkOutDate: Date;
}
