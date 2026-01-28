import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SchemaType } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';
import { HistoryService } from '../history/history.service';
import { AnalysisAgentFactory } from './analysis.factory';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private historyService: HistoryService,
    private agentFactory: AnalysisAgentFactory,
    private eventsGateway: EventsGateway,
    private usersService: UsersService
  ) {}

  private async getVentureContext(
    ventureId: string,
    currentTool: string
  ): Promise<string> {
    try {
      // Fetch the last 10 relevant analyses to build a robust context window
      const history = await this.historyService.getRecentAnalysesForContext(
        ventureId,
        currentTool
      );

      if (!history || history.length === 0) return '';

      // Format context using XML tags, which Gemini models parse highly effectively.
      // This distinguishes "Memory" from "Current Task".
      const contextRecords = history
        .map((record) => {
          // resultData is already a JSON string from the database
          // We just need to truncate it if too long
          const dataString =
            typeof record.resultData === 'string'
              ? record.resultData
              : JSON.stringify(record.resultData);
          const truncatedData =
            dataString.length > 4000
              ? dataString.substring(0, 4000) + '...(truncated)'
              : dataString;

          return `
    <historical_artifact type="${record.tool}" date="${record.createdAt}">
        ${truncatedData}
    </historical_artifact>`;
        })
        .join('\n');

      return `
<venture_memory_bank>
    <instruction>
        The following XML block contains previous analyses generated for this specific venture. 
        You MUST treat this as established fact. 
        If the current task contradicts the historical data (e.g., budget constraints vs. expensive marketing strategy), 
        you must align with the historical constraints or explicitly justify the pivot.
    </instruction>
    ${contextRecords}
</venture_memory_bank>
`;
    } catch (error) {
      console.warn('Failed to fetch venture context', error);
      return '';
    }
  }

  private emitLog(ventureId: string, agent: string, messageKey: string) {
    try {
      this.eventsGateway.emitLog(ventureId, {
        id: Math.random().toString(36).substr(2, 9),
        agent: agent,
        messageKey: messageKey,
        timestamp: Date.now(),
      });
    } catch (e) {
      // Fail silently on log emission errors to prevent crashing the analysis generation
      console.warn('Failed to emit agent log via WebSocket', e);
    }
  }

  async generateAnalysis(dto: GenerateAnalysisDto, userId: string) {
    let schema = dto.responseSchema;
    let promptKey = dto.prompt;

    if (!promptKey) {
      schema = {
        type: SchemaType.OBJECT,
        properties: { result: { type: SchemaType.STRING } },
      };
      promptKey = `Analyze: ${dto.description}`;
    }

    try {
      // 0. Check Credits (SaaS Limit)
      // If userId is dev-bypass, skip check. Otherwise enforce.
      if (userId !== 'dev-test-user-id') {
        await this.usersService.checkAndDeductCredits(userId);
      }

      this.emitLog(
        dto.ventureId,
        'Systems Architect',
        'agentLogAnalyzingContext'
      );

      // 1. Security & Access Check (Owner OR Member)
      const venture = await this.prisma.venture.findUnique({
        where: { id: dto.ventureId },
      });

      if (!venture) {
        await this.prisma.venture.create({
          data: {
            id: dto.ventureId,
            name: 'My Venture',
            userId: userId,
          },
        });
      } else {
        const isOwner = venture.userId === userId;
        let isMember = false;

        if (!isOwner) {
          const member = await this.prisma.ventureMember.findUnique({
            where: {
              ventureId_userId: {
                ventureId: dto.ventureId,
                userId: userId,
              },
            },
          });
          isMember = !!member;
        }

        if (!isOwner && !isMember) {
          // Venture exists but user doesn't have access
          // Check if this looks like a pre-auth venture (localStorage UUID)
          // If so, transfer ownership to the authenticated user
          const isPreAuthVenture =
            dto.ventureId.includes('-') && dto.ventureId.length > 30;

          if (isPreAuthVenture) {
            console.log(
              `Transferring pre-auth venture ${dto.ventureId} to user ${userId}`
            );
            await this.prisma.venture.update({
              where: { id: dto.ventureId },
              data: { userId: userId },
            });
          } else if (userId === 'dev-test-user-id') {
            console.warn(
              `Venture ${dto.ventureId} owner mismatch. Proceeding as Dev Admin.`
            );
          } else {
            throw new ForbiddenException(
              'Venture ID mismatch or unauthorized access.'
            );
          }
        }
      }

      // 2. Context Hydration (Standard or Refinement)
      let context = '';
      let finalPrompt = promptKey;
      let refinementSystemInstruction = '';

      if (dto.refinementInstruction && dto.parentAnalysisId) {
        this.emitLog(
          dto.ventureId,
          'Lead Strategist',
          'agentLogAnalyzingContext'
        ); // Re-use log for "Analyzing Request"

        // Fetch Parent Analysis
        const parentAnalysis = await (this.prisma as any).analysis.findUnique({
          where: { id: dto.parentAnalysisId },
        });

        if (!parentAnalysis)
          throw new NotFoundException(
            'Parent analysis for refinement not found.'
          );

        // Construct Refinement Prompt
        finalPrompt = `
            CONTEXT - ORIGINAL BUSINESS DESCRIPTION:
            "${dto.description}"

            CONTEXT - PREVIOUS ANALYSIS RESULT (JSON):
            ${JSON.stringify(parentAnalysis.resultData)}

            USER REFINEMENT REQUEST:
            "${dto.refinementInstruction}"

            TASK:
            Regenerate the analysis. Start with the "PREVIOUS ANALYSIS RESULT" as your baseline.
            Modify, update, or expand it based on the "USER REFINEMENT REQUEST".
            Keep the same JSON structure/schema as the previous result.
          `;

        refinementSystemInstruction = `
            You are an expert business consultant iterating on a draft.
            Your goal is to modify the existing analysis to better fit the user's specific feedback.
            Do not lose valuable information from the previous result unless the refinement contradicts it.
          `;
      } else {
        // Standard Flow
        this.emitLog(
          dto.ventureId,
          'Lead Strategist',
          'agentLogIdentifyingFactors'
        );
        context = await this.getVentureContext(dto.ventureId, dto.tool);
      }

      // 3. Agent Selection & Execution
      this.emitLog(dto.ventureId, 'Lead Strategist', 'agentLogSynthesizing');
      const agent = this.agentFactory.getAgent(dto.module, dto.tool);

      const baseSystemInstruction = `
You are the ATLAS AI Engine, a Lead Venture Architect and Tier-1 Strategy Consultant.
Your objective is to build a coherent, viable, and scalable business case for the user.

### CORE DIRECTIVES:
1. **Strategic Consistency:** Your output MUST align with the provided <venture_memory_bank>.
   - If the SWOT (in memory) identifies "Limited Capital" as a weakness, your Marketing Plan MUST focus on organic/low-cost channels.
   - If the Target Audience (in memory) is "Seniors", do not suggest "TikTok Influencers" as a channel.
2. **Data-Driven Realism:** Avoid generic fluff. Use specific numbers, KPIs, and industry benchmarks where possible.
3. **Critical Thinking:** Do not just agree with the user's description. If their input contradicts a previous analysis, highlight the discrepancy constructively.
4. **Structured Output:** You must return valid JSON conforming strictly to the requested schema.

### CONTEXT AWARENESS:
The user has provided a description and potentially a history of previous work.
Synthesize this information to produce the next logical step in their business planning.
`;

      const effectiveSystemInstruction = refinementSystemInstruction
        ? `${baseSystemInstruction}\n\n${refinementSystemInstruction}`
        : baseSystemInstruction;

      this.emitLog(
        dto.ventureId,
        'Market Researcher',
        'agentLogScanningMarket'
      );

      const response = await agent.generate(
        finalPrompt,
        context,
        schema,
        effectiveSystemInstruction,
        dto.images
      );

      // 4. Persistence
      this.emitLog(
        dto.ventureId,
        'Systems Architect',
        'agentLogFinalizingOutput'
      );
      const savedRecord = await (this.prisma as any).analysis.create({
        data: {
          ventureId: dto.ventureId,
          userId: userId,
          module: dto.module,
          tool: dto.tool,
          inputContext: dto.refinementInstruction
            ? `Refinement: ${dto.refinementInstruction}`
            : dto.description,
          resultData: JSON.stringify(response.data), // Prisma expects a String, not an Object
          parentId: dto.parentAnalysisId || undefined, // Link versions if refining
        },
      });

      return {
        ...response.data,
        id: savedRecord.id,
      };
    } catch (error: any) {
      console.error('Analysis Service Error:', error);
      if (error instanceof ForbiddenException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Failed to generate analysis'
      );
    }
  }
}
