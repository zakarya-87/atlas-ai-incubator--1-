import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: (req: Request) => {
        const cookies = req.cookies as Record<string, string> | undefined;
        let token: string | undefined = cookies?.accessToken;
        if (!token) {
          token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? undefined;
        }
        return token || null;
      },
      secretOrKey: secret,
    });
  }

  async validate(payload: { id: string; email: string }): Promise<User> {
    const { id } = payload;

    try {
      const user = await this.usersService.findById(id);

      if (!user) {
        this.logger.warn(`User not found for ID: ${id}`);
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(`Validation error for user ID ${id}:`, error);
      throw error;
    }
  }
}
