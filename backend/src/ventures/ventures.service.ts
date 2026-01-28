import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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

  async inviteMember(
    ventureId: string,
    ownerId: string,
    email: string,
    role: string
  ) {
    // 1. Verify Owner Access
    const venture = await (this.prisma as any).venture.findUnique({
      where: { id: ventureId },
      include: { user: true }, // include owner details
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
    // Check if already a member
    const existingMember = await (this.prisma as any).ventureMember.findUnique({
      where: {
        ventureId_userId: {
          ventureId,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      return (this.prisma as any).ventureMember.update({
        where: { id: existingMember.id },
        data: { role },
      });
    }

    const member = await (this.prisma as any).ventureMember.create({
      data: {
        ventureId,
        userId: invitee.id,
        role,
      },
    });

    // 4. Send Notification
    const ownerName = venture.user.fullName || venture.user.email;
    this.emailService
      .sendInviteEmail(email, ownerName, venture.name)
      .catch(console.error);

    return member;
  }

  async listMembers(ventureId: string, userId: string) {
    // Check access
    const membership = await this.checkAccess(ventureId, userId);
    if (!membership) throw new ForbiddenException('Access denied');

    const members = await (this.prisma as any).ventureMember.findMany({
      where: { ventureId },
      include: { user: { select: { email: true, fullName: true } } },
    });

    return members;
  }

  async checkAccess(ventureId: string, userId: string): Promise<boolean> {
    const venture = await (this.prisma as any).venture.findUnique({
      where: { id: ventureId },
    });
    if (venture && venture.userId === userId) return true;

    const member = await (this.prisma as any).ventureMember.findUnique({
      where: { ventureId_userId: { ventureId, userId } },
    });
    return !!member;
  }
}
