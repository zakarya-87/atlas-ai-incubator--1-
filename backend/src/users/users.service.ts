import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
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

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        credits: 5, // Explicit default
        role: 'USER', // Default role
        subscriptionStatus: 'free', // Default status
        subscriptionPlan: 'free', // Default plan
        fullName: email.split('@')[0], // Extract name from email as default
      },
    });
  }

  async createUserWithName(email: string, pass: string, name: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        credits: 100, // Default credits for new users
        role: 'USER',
        subscriptionStatus: 'free',
        subscriptionPlan: 'free',
        fullName: name,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const data: Prisma.UserUpdateInput = {};

    // Map name to fullName if provided
    if (dto.name) {
      data.fullName = dto.name;
    } else if (dto.fullName) {
      data.fullName = dto.fullName;
    }

    // Handle bio field (store in a metadata field or ignore if not in schema)
    // Note: bio is not in the current schema, so we'll skip it for now
    
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(dto.password, salt);
    }

    return this.prisma.user.update({
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
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    return updatedUser.credits;
  }
}
