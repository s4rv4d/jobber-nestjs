import { Resolver, Mutation, Args, Context } from '@jobber/graphql';
import { User } from '../users/models/user.model';
import { LoginInput } from './dto/login.input';
import { GQLContext } from '@jobber/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GQLContext
  ) {
    return this.authService.login(input, context.res);
  }
}
