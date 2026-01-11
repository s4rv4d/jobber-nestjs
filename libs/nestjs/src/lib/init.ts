import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

export async function init(app: INestApplication, globalPrefix = 'api') {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix(globalPrefix);
  // add cookie parser middleware
  app.use(cookieParser());
  // add logger middleware
  app.useLogger(app.get(Logger));
  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);
  app
    .get(Logger)
    .log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
    );
}
