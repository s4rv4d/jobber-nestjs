import { Job } from '../decorators/job.decorator';
import { AbstractJob } from './abstract.job';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarClient } from '@jobber/pulsar';

@Job({
  name: 'FibonacciJob',
  description: 'Calculates Fibonacci numbers sequence and store in db',
})
export class FibonacciJob extends AbstractJob {
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
