import { Module } from '@nestjs/common';
import { JobsModule } from './jobs.module';
import { UploadsModule } from './uploads/uploads.module';
import { ConfigModule } from '@nestjs/config';
import {
  GraphQLModule,
  ApolloDriver,
  ApolloDriverConfig,
} from '@jobber/graphql';
import { LoggerModule } from '@jobber/nestjs';
import { GqlLoggingPlugin } from '@jobber/graphql';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UploadsModule,
    LoggerModule,
    JobsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      plugins: [new GqlLoggingPlugin()],
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }), // pass express req and res to context
    }),
    PrismaModule,
  ],
})
export class AppModule {}
