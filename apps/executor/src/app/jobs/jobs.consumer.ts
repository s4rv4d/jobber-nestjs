import {
  AcknowledgeRequest,
  JOBS_SERVICE_NAME,
  JobsServiceClient,
} from '@jobber/grpc';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export abstract class JobsConsumer<
  T extends AcknowledgeRequest
> extends PulsarConsumer<T> {
  private jobsService: JobsServiceClient;

  constructor(
    topic: string,
    pulsarClient: PulsarClient,
    private readonly grpcClient: ClientGrpc
  ) {
    super(pulsarClient, topic);
  }

  // PulsarConsumer has implemented onModuleInit
  async onModuleInit() {
    this.jobsService =
      this.grpcClient.getService<JobsServiceClient>(JOBS_SERVICE_NAME);
    await super.onModuleInit();
  }

  protected async onMessage(message: T): Promise<void> {
    await this.execute(message);
    // message contains jobId
    await firstValueFrom(this.jobsService.acknowledge(message));
  }

  protected abstract execute(data: T): Promise<void>;
}
