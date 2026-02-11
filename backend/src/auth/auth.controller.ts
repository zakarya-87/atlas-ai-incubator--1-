import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    @Res({ passthrough: true }) res: Response
  ): Promise<{ success: boolean; access_token: string }> {
    const { accessToken } = await this.authService.signIn(authCredentialsDto);

    // Set JWT as httpOnly cookie for security
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax', // Lax is safer for dev/localhost
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/',
    });

    // Return token in body for Bearer auth + cookie for session auth (dual support)
    return { success: true, access_token: accessToken };
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {

    // Clear the JWT cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  @Post('/refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Res({ passthrough: true }) _res: Response): { success: boolean } {

    // This endpoint will validate the cookie and return a success status
    // The JWT validation is handled by the AuthGuard which will refresh the cookie if needed
    return { success: true };
  }
}
