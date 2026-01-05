// use this client to create subsequent producers and consumer
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Producer, Consumer, Message } from 'pulsar-client';

@Injectable()
export class PulsarClient implements OnModuleDestroy {
  // since this is going to be imported in jobs, add to env inside jobs
  private readonly client = new Client({
    serviceUrl: this.configService.getOrThrow<string>('PULSAR_SERVICE_URL'),
    operationTimeoutSeconds: 30,
    connectionTimeoutMs: 10000,
  });

  private readonly producers: Producer[] = [];
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createProducer(topic: string) {
    // use defual batch config
    const producer = await this.client.createProducer({
      blockIfQueueFull: true,
      topic,
    });

    this.producers.push(producer);

    return producer;
  }

  async createConsumer(topic: string, listener: (message: Message) => void) {
    const consumer = await this.client.subscribe({
      subscriptionType: 'Shared',
      topic,
      listener,
      subscription: 'jobber', // shared subscription, round robin fashion
    });

    this.consumers.push(consumer);

    return consumer;
  }

  async onModuleDestroy() {
    for (const producer of this.producers) {
      await producer.close();
    }

    for (const consumer of this.consumers) {
      await consumer.close();
    }

    await this.client.close();
  }
}
