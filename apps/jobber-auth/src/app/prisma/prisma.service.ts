import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/jobber-auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('AUTH_DATABASE_URL') || 'TEST_DB',
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
