import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import {
  PulsarClient,
  PulsarConsumer,
  LoadProductsMessage,
} from '@jobber/pulsar';
import {
  Packages,
  PRODUCTS_SERVICE_NAME,
  ProductsServiceClient,
} from '@jobber/grpc';
import { Jobs } from '@jobber/nestjs';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LoadProductsConsumer
  extends PulsarConsumer<LoadProductsMessage>
  implements OnModuleInit
{
  private productsServiceClient: ProductsServiceClient;

  constructor(
    pulsarClient: PulsarClient,
    @Inject(Packages.PRODUCTS) private client: ClientGrpc
  ) {
    super(pulsarClient, Jobs.LOAD_PRODUCTS);
  }

  async onModuleInit() {
    this.productsServiceClient = this.client.getService<ProductsServiceClient>(
      PRODUCTS_SERVICE_NAME
    );

    await super.onModuleInit();
  }

  async onMessage(message: LoadProductsMessage): Promise<void> {
    // grpc call to products grpc server
    await firstValueFrom(this.productsServiceClient.createProduct(message));
  }
}
