import { Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { FibonacciData } from './fibonacci-data.interface';
import { iterate } from 'fibonacci';

@Injectable()
export class FibonacciConsumer
  extends PulsarConsumer<FibonacciData>
  implements OnModuleInit
{
  // OnModuleInit needs to be added so that the impl in absract is executed

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, 'FibonacciJob');
  }

  async onMessage(message: FibonacciData): Promise<void> {
    const result = iterate(message.iterations);
    this.logger.log(result);
  }
}
