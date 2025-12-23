import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract.job';
import { FibonacciData } from './fibonacci-data.interface';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PulsarClient } from '@jobber/pulsar';

@Job({
  name: 'FibonacciJob',
  description: 'Calculates Fibonacci numbers sequence and store in db',
})
export class FibonacciJob extends AbstractJob<FibonacciData> {
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
