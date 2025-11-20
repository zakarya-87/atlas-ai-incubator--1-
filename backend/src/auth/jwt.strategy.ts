
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: (req: Request) => {
        // First try to extract from cookie
        let token = req?.cookies?.accessToken;

        // Fallback to Authorization header for backward compatibility
        if (!token) {
          token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        }

        return token;
      },
      secretOrKey: process.env.JWT_SECRET || 'secretKey', // Use environment variable
    });
  }

  async validate(payload: { email: string }): Promise<User> {
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
