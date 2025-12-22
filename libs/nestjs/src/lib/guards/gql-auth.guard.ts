import {
  Injectable,
  CanActivate,
  OnModuleInit,
  ExecutionContext,
  Inject,
  Logger,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable, of } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  AUTH_PACKAGE_NAME,
  AuthServiceClient,
  AUTH_SERVICE_NAME,
} from 'types/proto/auth';

@Injectable()
export class GqlAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(GqlAuthGuard.name);
  private authServiceClient: AuthServiceClient;

  // inject client which is register via job.module
  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    // init the service client via the injected client
    this.authServiceClient =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // gql to normal auth request which is eventually passed to JwtAuthGuard
    const token = this.getRequest(context).cookies?.Authentication;

    this.logger.log('token is: ', token);

    if (!token) {
      this.logger.error('No JWT is passed');
      return false;
    }

    return this.authServiceClient.authenticate({ token }).pipe(
      map((res) => {
        this.getRequest(context).user = res;
        return true;
      }),
      catchError((err) => {
        this.logger.error('error is: ', err);
        return of(false);
      }),
    );
  }

  private getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
