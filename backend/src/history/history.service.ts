import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getVentureHistory(ventureId: string, userId: string) {
    const venture = await (this.prisma as any).venture.findUnique({
      where: { id: ventureId },
    });

    // If venture doesn't exist or belongs to another user (and we are enforcing auth), return empty
    // In Dev Bypass, we might want to be more lenient, but for now this logic holds.
    if (!venture || venture.userId !== userId) {
      return [];
    }

    return (this.prisma as any).analysis.findMany({
      where: { ventureId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Used by AnalysisService for Context Hydration
  async getRecentAnalysesForContext(
    ventureId: string,
    excludeTool: string
  ): Promise<any[]> {
    return (this.prisma as any).analysis.findMany({
      where: {
        ventureId: ventureId,
        tool: { not: excludeTool },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        tool: true,
        resultData: true,
        inputContext: true,
      },
    });
  }

  async getAllAnalysesAdmin() {
    return (this.prisma as any).analysis.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { venture: { include: { user: { select: { email: true } } } } },
    });
  }

  async deleteAnalysis(analysisId: string, user: User) {
    const analysis = await (this.prisma as any).analysis.findUnique({
      where: { id: analysisId },
      include: { venture: true },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    const isOwner = analysis.venture.userId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this analysis'
      );
    }

    return (this.prisma as any).analysis.delete({
      where: { id: analysisId },
    });
  }

  async createManualVersion(dto: any, userId: string) {
    const venture = await (this.prisma as any).venture.findUnique({
      where: { id: dto.ventureId },
    });

    if (!venture) {
      throw new NotFoundException('Venture not found');
    }

    if (venture.userId !== userId) {
      throw new ForbiddenException(
        'Venture ID mismatch or unauthorized access.'
      );
    }

    return (this.prisma as any).analysis.create({
      data: {
        ventureId: dto.ventureId,
        userId: userId,
        module: dto.module,
        tool: dto.tool,
        inputContext: dto.description, // FIX: Mapped correctly from DTO 'description' to DB 'inputContext'
        resultData:
          typeof dto.data === 'string' ? dto.data : JSON.stringify(dto.data), // Prisma expects a String
        parentId: dto.parentId,
      },
    });
  }
}
