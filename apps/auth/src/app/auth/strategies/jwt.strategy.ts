import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../token-payload.interface';
import { AuthenticateRequest } from '@jobber/grpc';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) =>
          request.cookies?.Authentication ||
          (request as AuthenticateRequest).token,
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  // auth guard from authcontroller will trigger this
  validate(payload: TokenPayload) {
    // passport will attach this to the request object under req.user
    console.log('token payload: ', payload);
    return payload;
  }
}
