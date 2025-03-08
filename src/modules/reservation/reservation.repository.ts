import { InjectModel } from '@nestjs/mongoose';
import { ReservationModel } from './models/reservation.schema';
import { Model } from 'mongoose';
import { Reservation, ReservationStatus } from './models/reservation.types';

export class ReservationRepository {
  constructor(
    @InjectModel(ReservationModel.name)
    private reservationModel: Model<ReservationModel>,
  ) {}

  async updateStatus(reservation: Reservation, status: ReservationStatus) {
    await this.reservationModel.updateOne(
      { reservationId: reservation.reservationId },
      { $set: { status } },
    );
  }

  async update(reservation: Reservation) {
    await this.reservationModel.updateOne(
      { reservationId: reservation.reservationId },
      {
        $set: {
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          guestName: reservation.guestName,
          status: reservation.status,
        },
      },
    );
  }

  async save(reservation: Reservation) {
    await this.reservationModel.create(reservation);
  }

  async findById(reservationId: string): Promise<Reservation | null> {
    const reservationFromDb = await this.reservationModel
      .findOne({ reservationId })
      .exec();

    if (!reservationFromDb) {
      return null;
    }

    return {
      checkInDate: reservationFromDb.checkInDate,
      checkOutDate: reservationFromDb.checkOutDate,
      guestName: reservationFromDb.guestName,
      status: reservationFromDb.status as ReservationStatus,
      reservationId: reservationFromDb.reservationId,
    };
  }
}
