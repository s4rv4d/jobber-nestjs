import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JobModel } from './models/job.model';
import { JobsService } from './jobs.service';
import { ExecuteJobInput } from './dto/execute-job.input';

@Resolver(() => JobModel)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [JobModel], { name: 'jobs' })
  async getJobs() {
    return this.jobsService.getJobs();
  }

  @Mutation(() => JobModel)
  async executeJob(@Args('executeJobInput') executeJobInput: ExecuteJobInput) {
    return this.jobsService.executeJob(executeJobInput.name);
  }
}
