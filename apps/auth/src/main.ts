require('module-alias/register');
import { init } from '@jobber/nestjs';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { Packages } from '@jobber/grpc';

import { AppModule } from './app/app.module';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  await init(app, 'auth');

  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow('AUTH_GRPC_SERVICE_URL'),
      package: Packages.AUTH,
      protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
    },
  });

  // listen for grpc reqs
  await app.startAllMicroservices();
}

bootstrap();
