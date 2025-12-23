import { Producer } from 'pulsar-client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarClient, serialize } from '@jobber/pulsar';
import { BadRequestException } from '@nestjs/common';

export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  // define 'classconstructor'
  protected abstract messageClass: new () => T;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: T, job: string) {
    await this.validateData(data);

    // first execute by gql resolver
    // check if producer needs to be init and create producer and send message
    // else send message topic

    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(job);
    }

    await this.producer.send({ data: serialize<T>(data) });
  }

  private async validateData(data: T) {
    const errors = await validate(plainToInstance(this.messageClass, data));

    if (errors.length) {
      throw new BadRequestException(
        `Job data is invalid: ${JSON.stringify(errors)}`,
      );
    }
  }
}
