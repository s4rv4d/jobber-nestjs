import { Producer } from 'pulsar-client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarClient, serialize } from '@jobber/pulsar';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobStatus } from '../models/job-status.enum';

export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  // define 'classconstructor'
  protected abstract messageClass: new () => T;

  constructor(
    private readonly pulsarClient: PulsarClient,
    private readonly prismaService: PrismaService
  ) {}

  async execute(data: T, name: string) {
    // first execute by gql resolver
    // check if producer needs to be init and create producer and send message
    // else send message topic

    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(name);
    }

    const job = await this.prismaService.job.create({
      data: {
        name,
        size: Array.isArray(data) ? data.length : 1,
        completed: 0,
        status: JobStatus.IN_PROGRESS,
      },
    });

    // enables batch send messages
    if (Array.isArray(data)) {
      for (const message of data) {
        this.send({ ...message, jobId: job.id });
      }
      return;
    } else {
      this.send({ ...data, jobId: job.id });
    }
  }

  private send(data: T) {
    this.validateData(data).then(() => {
      // messages sent to a buffer, after a timeout the who buffer is offloaded and sent to pulsar cluster
      this.producer.send({ data: serialize<T>(data) });
    });
  }

  private async validateData(data: T) {
    const errors = await validate(plainToInstance(this.messageClass, data));

    if (errors.length) {
      throw new BadRequestException(
        `Job data is invalid: ${JSON.stringify(errors)}`
      );
    }
  }
}
