import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import type { Params } from 'nestjs-pino';
import { pinoHttp } from 'pino-http';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService): Params => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: pinoHttp({
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class LoggerModule {}
