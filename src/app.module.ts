import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';
import { LoggerModule } from 'nestjs-pino';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import * as getenv from 'getenv';
import { BullModule } from '@nestjs/bullmq';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: getenv.string('REDIS_HOST'),
        port: getenv.int('REDIS_PORT'),
        password: getenv.string('REDIS_PASSWORD'),
      },
    }),
    MongooseModule.forRoot(getenv('DATABASE_URL')),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          level: getenv.string('LOG_LEVEL', 'trace'),
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: true,
              messageFormat: '[{context}] {msg}',
              ignore: 'req,context',
            },
          },
          base: null,
          autoLogging: false,
        },
      }),
    }),
    CqrsModule.forRoot(),
    TaskModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
