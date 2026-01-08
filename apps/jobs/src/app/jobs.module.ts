import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { LoadProductsJob } from './jobs/products/load-products.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { Packages } from '@jobber/grpc';
import { PulsarModule } from '@jobber/pulsar';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JobsController } from './jobs.controller';

@Module({
  imports: [
    DiscoveryModule,
    PulsarModule,
    ClientsModule.registerAsync([
      {
        name: Packages.AUTH,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow('AUTH_GRPC_SERVICE_URL'),
            package: Packages.AUTH,
            protoPath: join(__dirname, '../../libs/grpc/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PrismaModule,
  ],
  providers: [FibonacciJob, JobsService, JobsResolver, LoadProductsJob],
  controllers: [JobsController],
  exports: [],
})
export class JobsModule {}
