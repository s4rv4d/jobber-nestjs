import { Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient, PulsarConsumer, FibonacciMessage } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Jobs } from '@jobber/nestjs';

@Injectable()
export class FibonacciConsumer
  extends PulsarConsumer<FibonacciMessage>
  implements OnModuleInit
{
  // OnModuleInit needs to be added so that the impl in absract is executed

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, Jobs.FIBONACCI);
  }

  async onMessage(message: FibonacciMessage): Promise<void> {
    const result = iterate(message.iterations);
    this.logger.log(result);
  }
}
