import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GrpcLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcLoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const handler = context.getHandler().name;
    const args = context.getArgs()[0];
    const start = Date.now();
    const requestId = uuidv4();

    this.logger.log({
      requestId,
      handler,
      args,
    });

    return next.handle().pipe(
      tap((res) => {
        this.logger.log({
          requestId,
          handler,
          duration: Date.now() - start,
        });
      })
    );
  }
}
