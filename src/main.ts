import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';
import * as getenv from 'getenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uploadDir = getenv.string('UPLOAD_DIR', 'uploads');

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(getenv.int('HTTP_PORT', 3000));
}
bootstrap();
