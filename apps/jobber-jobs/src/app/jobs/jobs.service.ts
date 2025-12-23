import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import {
  DiscoveryService,
  DiscoveredClassWithMeta,
} from '@golevelup/nestjs-discovery';
import { JOB_METADATA_KEY } from '../decorators/job.decorator';
import { JobMetadata } from '../interfaces/job-metadata.interface';
import { AbstractJob } from './abstract.job';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.jobs =
      await this.discoveryService.providersWithMetaAtKey<JobMetadata>(
        JOB_METADATA_KEY,
      );
  }

  getJobs() {
    return this.jobs.map((job) => job.meta);
  }

  async executeJob(name: string) {
    const job = this.jobs.find((job) => job.meta.name === name);

    if (!job) {
      throw new BadRequestException(`Job with name ${name} not found`);
    }

    await (job.discoveredClass.instance as AbstractJob).execute(
      {},
      job.meta.name,
    );

    return job.meta;
  }
}
