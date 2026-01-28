import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
  @UseGuards(JwtAuthGuard)
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @ApiOperation({
    summary: 'Get the profile of the currently authenticated user',
  })
  async getProfile(@GetUser() user: User) {
    // Fetch fresh user data to ensure credits are up-to-date
    const freshUser = await this.usersService.findById(user.id);
    if (!freshUser) {
      throw new NotFoundException('User not found');
    }
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
