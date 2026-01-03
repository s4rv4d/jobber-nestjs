import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarModule } from '@jobber/pulsar';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DiscoveryModule,
    PulsarModule,
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [FibonacciJob, JobsService, JobsResolver],
  exports: [],
})
export class JobsModule {}
