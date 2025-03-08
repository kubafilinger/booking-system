import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReservationDocument = HydratedDocument<ReservationModel>;

@Schema()
export class ReservationModel {
  @Prop({ required: true, unique: true })
  reservationId: string;

  @Prop({ required: true })
  guestName: string;

  @Prop({
    enum: ['oczekująca', 'anulowana', 'zrealizowana'],
    default: 'oczekująca',
  })
  status: string;

  @Prop({ required: true })
  checkInDate: Date;

  @Prop({ required: true })
  checkOutDate: Date;

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(ReservationModel);
