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
        let token = req?.cookies?.accessToken;
        if (!token) {
          token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        }
        return token;
      },
      secretOrKey: process.env.JWT_SECRET,
    });

  }

  async validate(payload: { id: string; email: string }): Promise<User> {
    const { id } = payload;

    try {
      const user = await this.usersService.findById(id);

      if (!user) {
        console.warn(`[JwtStrategy] User not found for ID: ${id}`);
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      console.error(`[JwtStrategy] Validation error for user ID ${id}:`, error);
      throw error;
    }
  }

}
