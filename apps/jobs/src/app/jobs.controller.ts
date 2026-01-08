import { Controller } from '@nestjs/common';
import {
  AcknowledgeRequest,
  JobsServiceController,
  JobsServiceControllerMethods,
} from '@jobber/grpc';
import { JobsService } from './jobs.service';

@Controller()
@JobsServiceControllerMethods() // decorates with appropriate meta so nestjs know to direact grpc requests here
export class JobsController implements JobsServiceController {
  constructor(private readonly jobsService: JobsService) {}

  async acknowledge(request: AcknowledgeRequest) {
    await this.jobsService.acknowledge(request.jobId);
  }
}
