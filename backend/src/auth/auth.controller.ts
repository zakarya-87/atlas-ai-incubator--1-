import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
});

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  // ── Canonical endpoints ───────────────────────────────────────────────────

  @Post('/register')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    const result = await this.authService.register(registerDto);
    res.cookie('accessToken', result.access_token, cookieOptions());
    return result;
  }

  @Post('/login')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    const result = await this.authService.login(authCredentialsDto);
    res.cookie('accessToken', result.access_token, cookieOptions());
    return result;
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout — clears the auth cookie' })
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
    res.clearCookie('accessToken', cookieOptions());
    return { success: true };
  }

  @Post('/refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Validate the current session cookie' })
  refresh(@Res({ passthrough: true }) _res: Response): { success: boolean } {
    return { success: true };
  }

  // ── Legacy aliases (kept for backwards-compatibility) ────────────────────

  /** @deprecated Use POST /auth/register */
  @Post('/signup')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Register a new user (legacy alias for /register)' })
  async signUp(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    return this.register(registerDto, res);
  }

  /** @deprecated Use POST /auth/login */
  @Post('/signin')
  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Sign in (legacy alias for /login)' })
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string } }> {
    return this.login(authCredentialsDto, res);
  }
}
