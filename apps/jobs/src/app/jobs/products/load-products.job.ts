import { Job } from '../../decorators/job.decorator';
import { Jobs } from '@jobber/nestjs';
import { AbstractJob } from '../abstract.job';
import { LoadProductsMessage, PulsarClient } from '@jobber/pulsar';

@Job({
  name: Jobs.LOAD_PRODUCTS,
  description: 'Loads uploaded product data into the db after enrichment',
})
export class LoadProductsJob extends AbstractJob<LoadProductsMessage> {
  protected messageClass = LoadProductsMessage;

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
