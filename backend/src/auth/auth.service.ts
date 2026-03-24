import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async register(
    registerDto: RegisterDto
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user with name
    const user = await this.usersService.createUserWithName(
      email,
      password,
      name || email.split('@')[0]
    );

    // Generate JWT token
    const payload = { email, role: user.role, id: user.id };
    const access_token = await this.jwtService.signAsync(payload);

    // Fire and forget welcome email
    this.emailService.sendWelcomeEmail(email).catch(console.error);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || email.split('@')[0],
      },
    };
  }

  async login(
    authCredentialsDto: AuthCredentialsDto
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    const { email, password } = authCredentialsDto;
    const user = await this.usersService.findOne(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email, role: user.role, id: user.id };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || email.split('@')[0],
      },
    };
  }
}
