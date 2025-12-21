import { Job } from '../decorators/job.decorator';
import { AbstractJob } from './abstract.job';

@Job({
  name: 'FibonacciJob',
  description: 'Calculates Fibonacci numbers sequence and store in db',
})
export class FibonacciJob extends AbstractJob {}
