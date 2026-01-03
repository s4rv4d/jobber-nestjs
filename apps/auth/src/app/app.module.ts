import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import {
  GraphQLModule,
  ApolloDriver,
  ApolloDriverConfig,
} from '@jobber/graphql';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from '@jobber/nestjs';
import { GqlLoggingPlugin } from '@jobber/graphql';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      },
      plugins: [new GqlLoggingPlugin()],
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }), // pass express req and res to context
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
