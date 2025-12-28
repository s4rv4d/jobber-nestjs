import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@jobber/graphql';

export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // convertes http context to graphql context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
