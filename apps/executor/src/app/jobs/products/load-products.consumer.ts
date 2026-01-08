import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { PulsarClient, LoadProductsMessage } from '@jobber/pulsar';
import {
  Packages,
  PRODUCTS_SERVICE_NAME,
  ProductsServiceClient,
} from '@jobber/grpc';
import { Jobs } from '@jobber/nestjs';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JobsConsumer } from '../jobs.consumer';

@Injectable()
export class LoadProductsConsumer
  extends JobsConsumer<LoadProductsMessage>
  implements OnModuleInit
{
  private productsServiceClient: ProductsServiceClient;

  constructor(
    pulsarClient: PulsarClient,
    @Inject(Packages.JOBS) jobsClient: ClientGrpc,
    @Inject(Packages.PRODUCTS) private productsClient: ClientGrpc
  ) {
    super(Jobs.LOAD_PRODUCTS, pulsarClient, jobsClient);
  }

  async onModuleInit() {
    this.productsServiceClient =
      this.productsClient.getService<ProductsServiceClient>(
        PRODUCTS_SERVICE_NAME
      );

    await super.onModuleInit();
  }

  async execute(message: LoadProductsMessage): Promise<void> {
    // grpc call to products grpc server
    await firstValueFrom(this.productsServiceClient.createProduct(message));
  }
}
