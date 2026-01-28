import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { VenturesService } from './ventures.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('VenturesService', () => {
  let service: VenturesService;
  let prismaService: any;
  let usersService: any;
  let emailService: any;

  const mockOwner = {
    id: 'owner-123',
    email: 'owner@example.com',
    fullName: 'John Owner',
  };

  const mockInvitee = {
    id: 'invitee-456',
    email: 'invitee@example.com',
    fullName: 'Jane Invitee',
  };

  const mockVenture = {
    id: 'venture-123',
    name: 'Test Startup',
    userId: 'owner-123',
    user: mockOwner,
  };

  beforeEach(async () => {
    prismaService = {
      venture: {
        findUnique: jest.fn(),
      },
      ventureMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    usersService = {
      findOne: jest.fn(),
    };

    emailService = {
      sendInviteEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VenturesService,
        { provide: PrismaService, useValue: prismaService },
        { provide: UsersService, useValue: usersService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<VenturesService>(VenturesService);
  });

  describe('inviteMember', () => {
    it('should successfully invite a new member', async () => {
      const role = 'editor';

      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      usersService.findOne.mockResolvedValue(mockInvitee);
      prismaService.ventureMember.findUnique.mockResolvedValue(null);
      prismaService.ventureMember.create.mockResolvedValue({
        id: 'member-id',
        ventureId: mockVenture.id,
        userId: mockInvitee.id,
        role,
      });

      const result = await service.inviteMember(
        mockVenture.id,
        mockOwner.id,
        mockInvitee.email,
        role
      );

      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({
        where: { id: mockVenture.id },
        include: { user: true },
      });
      expect(usersService.findOne).toHaveBeenCalledWith(mockInvitee.email);
      expect(prismaService.ventureMember.create).toHaveBeenCalledWith({
        data: {
          ventureId: mockVenture.id,
          userId: mockInvitee.id,
          role,
        },
      });
      expect(emailService.sendInviteEmail).toHaveBeenCalledWith(
        mockInvitee.email,
        mockOwner.fullName,
        mockVenture.name
      );
      expect(result.role).toBe(role);
    });

    it('should throw NotFoundException if venture does not exist', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);

      await expect(
        service.inviteMember(
          'nonexistent-venture',
          mockOwner.id,
          mockInvitee.email,
          'editor'
        )
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.inviteMember(
          'nonexistent-venture',
          mockOwner.id,
          mockInvitee.email,
          'editor'
        )
      ).rejects.toThrow('Venture not found');
    });

    it('should throw ForbiddenException if requester is not the owner', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      await expect(
        service.inviteMember(
          mockVenture.id,
          'different-user-id',
          mockInvitee.email,
          'editor'
        )
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.inviteMember(
          mockVenture.id,
          'different-user-id',
          mockInvitee.email,
          'editor'
        )
      ).rejects.toThrow('Only the owner can invite members');
    });

    it('should throw NotFoundException if invitee does not exist', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      usersService.findOne.mockResolvedValue(null);

      await expect(
        service.inviteMember(
          mockVenture.id,
          mockOwner.id,
          'nonexistent@example.com',
          'editor'
        )
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.inviteMember(
          mockVenture.id,
          mockOwner.id,
          'nonexistent@example.com',
          'editor'
        )
      ).rejects.toThrow(
        'User with this email not found. They must register first.'
      );
    });

    it('should throw BadRequestException if trying to invite self', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      usersService.findOne.mockResolvedValue(mockOwner);

      await expect(
        service.inviteMember(
          mockVenture.id,
          mockOwner.id,
          mockOwner.email,
          'editor'
        )
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.inviteMember(
          mockVenture.id,
          mockOwner.id,
          mockOwner.email,
          'editor'
        )
      ).rejects.toThrow('You cannot invite yourself');
    });

    it('should update role if member already exists', async () => {
      const existingMember = {
        id: 'existing-member-id',
        ventureId: mockVenture.id,
        userId: mockInvitee.id,
        role: 'viewer',
      };

      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      usersService.findOne.mockResolvedValue(mockInvitee);
      prismaService.ventureMember.findUnique.mockResolvedValue(existingMember);
      prismaService.ventureMember.update.mockResolvedValue({
        ...existingMember,
        role: 'editor',
      });

      const result = await service.inviteMember(
        mockVenture.id,
        mockOwner.id,
        mockInvitee.email,
        'editor'
      );

      expect(prismaService.ventureMember.update).toHaveBeenCalledWith({
        where: { id: existingMember.id },
        data: { role: 'editor' },
      });
      expect(prismaService.ventureMember.create).not.toHaveBeenCalled();
      expect(result.role).toBe('editor');
    });

    it('should use owner email if fullName is not available', async () => {
      const ownerWithoutName = { ...mockOwner, fullName: null };
      const ventureWithoutName = { ...mockVenture, user: ownerWithoutName };

      prismaService.venture.findUnique.mockResolvedValue(ventureWithoutName);
      usersService.findOne.mockResolvedValue(mockInvitee);
      prismaService.ventureMember.findUnique.mockResolvedValue(null);
      prismaService.ventureMember.create.mockResolvedValue({});

      await service.inviteMember(
        mockVenture.id,
        mockOwner.id,
        mockInvitee.email,
        'editor'
      );

      expect(emailService.sendInviteEmail).toHaveBeenCalledWith(
        mockInvitee.email,
        ownerWithoutName.email,
        mockVenture.name
      );
    });

    it('should not fail if email sending fails', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      usersService.findOne.mockResolvedValue(mockInvitee);
      prismaService.ventureMember.findUnique.mockResolvedValue(null);
      prismaService.ventureMember.create.mockResolvedValue({ id: 'member-id' });
      emailService.sendInviteEmail.mockRejectedValue(
        new Error('Email service down')
      );

      // Should not throw even if email fails (fire and forget)
      await expect(
        service.inviteMember(
          mockVenture.id,
          mockOwner.id,
          mockInvitee.email,
          'editor'
        )
      ).resolves.toBeDefined();
    });
  });

  describe('listMembers', () => {
    it('should return list of members for owner', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          ventureId: mockVenture.id,
          userId: 'user-1',
          role: 'editor',
          user: { email: 'user1@example.com', fullName: 'User One' },
        },
        {
          id: 'member-2',
          ventureId: mockVenture.id,
          userId: 'user-2',
          role: 'viewer',
          user: { email: 'user2@example.com', fullName: 'User Two' },
        },
      ];

      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.ventureMember.findMany.mockResolvedValue(mockMembers);

      const result = await service.listMembers(mockVenture.id, mockOwner.id);

      expect(result).toEqual(mockMembers);
      expect(prismaService.ventureMember.findMany).toHaveBeenCalledWith({
        where: { ventureId: mockVenture.id },
        include: { user: { select: { email: true, fullName: true } } },
      });
    });

    it('should return list of members for existing member', async () => {
      const memberId = 'member-456';
      const mockMembers = [];

      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.ventureMember.findUnique.mockResolvedValue({
        id: memberId,
        ventureId: mockVenture.id,
        userId: memberId,
        role: 'viewer',
      });
      prismaService.ventureMember.findMany.mockResolvedValue(mockMembers);

      const result = await service.listMembers(mockVenture.id, memberId);

      expect(result).toEqual(mockMembers);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.ventureMember.findUnique.mockResolvedValue(null);

      await expect(
        service.listMembers(mockVenture.id, 'unauthorized-user')
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.listMembers(mockVenture.id, 'unauthorized-user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('checkAccess', () => {
    it('should return true if user is the owner', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      const result = await service.checkAccess(mockVenture.id, mockOwner.id);

      expect(result).toBe(true);
      expect(prismaService.ventureMember.findUnique).not.toHaveBeenCalled();
    });

    it('should return true if user is a member', async () => {
      const differentVenture = { ...mockVenture, userId: 'different-owner' };
      prismaService.venture.findUnique.mockResolvedValue(differentVenture);
      prismaService.ventureMember.findUnique.mockResolvedValue({
        id: 'member-id',
        ventureId: mockVenture.id,
        userId: mockInvitee.id,
        role: 'editor',
      });

      const result = await service.checkAccess(mockVenture.id, mockInvitee.id);

      expect(result).toBe(true);
      expect(prismaService.ventureMember.findUnique).toHaveBeenCalledWith({
        where: {
          ventureId_userId: {
            ventureId: mockVenture.id,
            userId: mockInvitee.id,
          },
        },
      });
    });

    it('should return false if user is not owner or member', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      prismaService.ventureMember.findUnique.mockResolvedValue(null);

      const result = await service.checkAccess(
        mockVenture.id,
        'unauthorized-user'
      );

      expect(result).toBe(false);
    });

    it('should return false if venture does not exist', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null);

      const result = await service.checkAccess(
        'nonexistent-venture',
        mockOwner.id
      );

      expect(result).toBe(false);
    });
  });
});
