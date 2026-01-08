import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient, FibonacciMessage } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Jobs } from '@jobber/nestjs';
import { JobsConsumer } from '../jobs.consumer';
import { ClientGrpc } from '@nestjs/microservices';
import { Packages } from '@jobber/grpc';

@Injectable()
export class FibonacciConsumer
  extends JobsConsumer<FibonacciMessage>
  implements OnModuleInit
{
  // OnModuleInit needs to be added so that the impl in absract is executed

  constructor(
    pulsarClient: PulsarClient,
    @Inject(Packages.JOBS) jobsClient: ClientGrpc
  ) {
    super(Jobs.FIBONACCI, pulsarClient, jobsClient);
  }

  async execute(message: FibonacciMessage): Promise<void> {
    const result = iterate(message.iterations);
    this.logger.log(result);
  }
}
