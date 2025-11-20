
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the currently authenticated user' })
  async getProfile(@GetUser() user: User) {
    // Fetch fresh user data to ensure credits are up-to-date
    const freshUser = await this.usersService.findById(user.id);
    const { password, ...result } = freshUser;
    return result;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile details' })
  async updateProfile(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    const updatedUser = await this.usersService.updateUser(user.id, dto);
    const { password, ...result } = updatedUser;
    return result;
  }
}
