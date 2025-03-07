import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './modules/task/task.module';
import { LoggerModule } from 'nestjs-pino';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo/booking-system'),
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: true,
              messageFormat: '[{context}] {msg}',
              ignore: 'context',
            },
          },
          base: null,
          autoLogging: false,
        },
      }),
    }),
    CqrsModule.forRoot(),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
