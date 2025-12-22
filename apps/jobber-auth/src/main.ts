/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AUTH_PACKAGE_NAME } from 'types/proto/auth';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix(globalPrefix);
  // add cookie parser middleware
  app.use(cookieParser());
  const port = app.get(ConfigService).getOrThrow('PORT');

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: AUTH_PACKAGE_NAME,
      protoPath: join(__dirname, 'proto/auth.proto'),
    },
  });

  // listen for http and grpc reqs
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
