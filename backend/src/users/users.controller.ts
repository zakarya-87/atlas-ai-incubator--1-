import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as bcrypt from 'bcrypt';


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
  async getProfile(@GetUser() user: User): Promise<Omit<User, 'password'>> {
    // Fetch fresh user data to ensure credits are up-to-date
    const freshUser = await this.usersService.findById(user.id);
    if (!freshUser) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = freshUser;
    return result;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile details (partial update)' })
  async updateProfile(
    @GetUser() user: User,
    @Body() dto: UpdateUserDto
  ): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.usersService.updateUser(user.id, dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile details (full update)' })
  async putProfile(
    @GetUser() user: User,
    @Body() dto: UpdateUserDto
  ): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.usersService.updateUser(user.id, dto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @GetUser() user: User,
    @Body() dto: ChangePasswordDto
  ): Promise<{ success: boolean }> {
    // Verify current password
    const freshUser = await this.usersService.findById(user.id);
    if (!freshUser) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, freshUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update to new password
    await this.usersService.updateUser(user.id, { password: dto.newPassword });
    
    return { success: true };
  }
}
