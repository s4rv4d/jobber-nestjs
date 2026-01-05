import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';
import { PulsarClient, FibonacciMessage } from '@jobber/pulsar';
import { Jobs } from '@jobber/nestjs';

@Job({
  name: Jobs.FIBONACCI,
  description: 'Calculates Fibonacci numbers sequence and store in db',
})
export class FibonacciJob extends AbstractJob<FibonacciMessage> {
  protected messageClass = FibonacciMessage;

  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
