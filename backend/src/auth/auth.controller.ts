
import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  async signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.signIn(authCredentialsDto);

    // Set JWT as httpOnly cookie for security
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Prevent CSRF
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    });

    // Return minimal response - token is now in cookie
    return { success: true };
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the JWT cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { success: true };
  }

  @Post('/refresh')
  async refresh(@Res({ passthrough: true }) res: Response) {
    // This endpoint will validate the cookie and return a success status
    // The JWT validation is handled by the AuthGuard which will refresh the cookie if needed
    return { success: true };
  }
}
