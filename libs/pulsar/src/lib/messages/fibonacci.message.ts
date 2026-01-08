import { IsNotEmpty, IsNumber } from 'class-validator';
import { JobsMessage } from './jobs.message';

export class FibonacciMessage extends JobsMessage {
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
