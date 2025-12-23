import { Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { Message } from 'pulsar-client';

@Injectable()
export class FibonacciConsumer extends PulsarConsumer implements OnModuleInit {
  // OnModuleInit needs to be added so that the impl in absract is executed

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, 'FibonacciJob');
  }

  async onMessage(message: Message): Promise<void> {
    console.log('FibonacciConsumer.onMessage');
    await this.acknowledge(message);
  }
}
