import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReservationDocument = HydratedDocument<ReportModel>;

@Schema({ timestamps: true })
export class ReportModel {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  row: number;

  @Prop({ required: true })
  reservationId: string;

  @Prop({ type: [String], required: true })
  errors: string[];
}

export const ReportSchema = SchemaFactory.createForClass(ReportModel);
