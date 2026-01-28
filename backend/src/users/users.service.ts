import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return (this.prisma as any).user.findUnique({
      where: { id },
    });
  }

  async createUser(email: string, pass: string): Promise<void> {
    // Check if user already exists to avoid unique constraint errors
    const existingUser = await this.findOne(email);
    if (existingUser) {
      return; // User already exists, nothing to do
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    await (this.prisma as any).user.create({
      data: {
        email,
        password: hashedPassword,
        credits: 5, // Explicit default
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const data: any = { ...dto };

    if (dto.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(dto.password, salt);
    }

    return (this.prisma as any).user.update({
      where: { id },
      data: data,
    });
  }

  async checkAndDeductCredits(userId: string): Promise<number> {
    const user = await this.findById(userId);

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // 1. Bypass if Pro
    if (user.subscriptionStatus === 'active') {
      return -1; // Indicator for unlimited
    }

    // 2. Check Balance
    if (user.credits <= 0) {
      throw new ForbiddenException(
        'Insufficient credits. Please upgrade to Pro to continue generating insights.'
      );
    }

    // 3. Deduct
    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    return updatedUser.credits;
  }
}
