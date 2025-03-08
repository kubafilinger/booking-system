import { Module } from '@nestjs/common';
import { TaskConsumer } from './consumers/task.consumer';
import { ReservationRepository } from './reservation.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReservationModel,
  ReservationSchema,
} from './models/reservation.schema';
import { ProcessFileHandler } from './handlers/process-file.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ReservationModel.name,
        schema: ReservationSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [TaskConsumer, ReservationRepository, ProcessFileHandler],
})
export class ReservationModule {}
