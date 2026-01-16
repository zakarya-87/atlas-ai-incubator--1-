
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

  async validate(payload: { email: string }): Promise<any> {
    // Temporarily disabled for testing. Always returns an admin user.
    return {
      id: 'cl-admin-user-id',
      email: 'admin@atlas.com',
      role: 'ADMIN',
      credits: 999,
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
