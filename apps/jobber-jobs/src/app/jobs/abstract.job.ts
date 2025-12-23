import { OnModuleDestroy } from '@nestjs/common';
import { Producer } from 'pulsar-client';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarClient } from '@jobber/pulsar';

export abstract class AbstractJob<T> implements OnModuleDestroy {
  private producer: Producer;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async onModuleDestroy() {
    // await this.producer.close();
    if (this.producer) {
      await this.producer.close();
    }
  }

  async execute(data: T, job: string) {
    // first execute by gql resolver
    // check if producer needs to be init and create producer and send message
    // else send message topic

    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(job);
    }

    await this.producer.send({ data: Buffer.from(JSON.stringify(data)) });
  }
}
