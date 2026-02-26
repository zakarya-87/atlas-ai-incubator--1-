import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Venture, VentureMember } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class VenturesService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private emailService: EmailService
  ) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async create(userId: string, name: string, description?: string): Promise<Venture> {
    return this.prisma.venture.create({
      data: { name, description, userId },
    });
  }

  async findAll(userId: string): Promise<Venture[]> {
    return this.prisma.venture.findMany({
      where: {
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Venture> {
    const venture = await this.prisma.venture.findUnique({ where: { id } });
    if (!venture) throw new NotFoundException('Venture not found');
    const hasAccess = await this.checkAccess(id, userId);
    if (!hasAccess) throw new ForbiddenException('Access denied');
    return venture;
  }

  async update(id: string, userId: string, data: { name?: string; description?: string }): Promise<Venture> {
    const venture = await this.prisma.venture.findUnique({ where: { id } });
    if (!venture) throw new NotFoundException('Venture not found');
    if (venture.userId !== userId) throw new ForbiddenException('Only the owner can update this venture');
    return this.prisma.venture.update({ where: { id }, data });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const venture = await this.prisma.venture.findUnique({ where: { id } });
    if (!venture) throw new NotFoundException('Venture not found');
    if (venture.userId !== userId) throw new ForbiddenException('Only the owner can delete this venture');
    await this.prisma.venture.delete({ where: { id } });
    return { message: 'Venture deleted successfully' };
  }

  // ─── TEAM COLLABORATION ───────────────────────────────────────────────────

  async inviteMember(
    ventureId: string,
    ownerId: string,
    email: string,
    role: string
  ): Promise<VentureMember> {
    // 1. Verify Owner Access
    const venture = await this.prisma.venture.findUnique({
      where: { id: ventureId },
      include: { owner: true },
    });

    if (!venture) throw new NotFoundException('Venture not found');
    if (venture.userId !== ownerId)
      throw new ForbiddenException('Only the owner can invite members');

    // 2. Find User to Invite
    const invitee = await this.usersService.findOne(email);
    if (!invitee)
      throw new NotFoundException(
        'User with this email not found. They must register first.'
      );

    if (invitee.id === ownerId)
      throw new BadRequestException('You cannot invite yourself');

    // 3. Create Membership
    const existingMember = await this.prisma.ventureMember.findUnique({
      where: {
        ventureId_userId: {
          ventureId,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      return this.prisma.ventureMember.update({
        where: { id: existingMember.id },
        data: { role },
      });
    }

    const member = await this.prisma.ventureMember.create({
      data: {
        ventureId,
        userId: invitee.id,
        role,
      },
    });

    // 4. Send Notification
    const ownerName = venture.owner.fullName || venture.owner.email;
    this.emailService
      .sendInviteEmail(email, ownerName, venture.name)
      .catch(console.error);

    return member;
  }

  async listMembers(
    ventureId: string,
    userId: string
  ): Promise<(VentureMember & { user: { email: string; fullName: string | null } })[]> {
    const hasAccess = await this.checkAccess(ventureId, userId);
    if (!hasAccess) throw new ForbiddenException('Access denied');

    const members = await this.prisma.ventureMember.findMany({
      where: { ventureId },
      include: { user: { select: { email: true, fullName: true } } },
    });

    return members;
  }

  async checkAccess(ventureId: string, userId: string): Promise<boolean> {
    const venture = await this.prisma.venture.findUnique({
      where: { id: ventureId },
    });
    if (venture && venture.userId === userId) return true;

    const member = await this.prisma.ventureMember.findUnique({
      where: { ventureId_userId: { ventureId, userId } },
    });
    return !!member;
  }
}
