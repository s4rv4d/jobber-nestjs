import { AuthGuard } from '@nestjs/passport';

// let req obj be as is
// invokes jwt strategy because of AuthGuard
export class JwtAuthGuard extends AuthGuard('jwt') {}
