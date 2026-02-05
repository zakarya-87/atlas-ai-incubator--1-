import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private prisma: PrismaService) {}

  async getIntegrations(ventureId: string, userId: string) {
    await this.validateVentureAccess(ventureId, userId);

    return this.prisma.integration.findMany({
      where: { ventureId },
    });
  }

  async toggleIntegration(
    ventureId: string,
    userId: string,
    provider: string,
    connect: boolean
  ) {
    await this.validateVentureAccess(ventureId, userId);

    if (connect) {
      const mockConfig = JSON.stringify({
        accessToken: `mock_${provider}_token_${Date.now()}`,
        connectedAt: new Date().toISOString(),
      });

      return this.prisma.integration.upsert({
        where: {
          ventureId_provider: {
            ventureId,
            provider,
          },
        },
        update: {
          status: 'connected',
          config: mockConfig,
        },
        create: {
          ventureId,
          provider,
          status: 'connected',
          config: mockConfig,
        },
      });
    } else {
      return this.prisma.integration.update({
        where: {
          ventureId_provider: {
            ventureId,
            provider,
          },
        },
        data: {
          status: 'disconnected',
          config: null,
        },
      });
    }
  }

  private async validateVentureAccess(ventureId: string, userId: string) {
    const venture = await this.prisma.venture.findUnique({
      where: { id: ventureId },
    });

    if (!venture) {
      await this.prisma.venture.create({
        data: {
          id: ventureId,
          userId,
          name: `Venture ${ventureId.substring(0, 8)}`,
          description: 'Auto-created venture',
          industry: 'Technology',
          stage: 'idea'
        },
      });
      return;
    }

    if (venture.userId !== userId) {
      throw new ForbiddenException('Access denied to this venture');
    }
  }
}
