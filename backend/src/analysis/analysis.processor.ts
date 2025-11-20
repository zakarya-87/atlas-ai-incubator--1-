import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { AnalysisAgentFactory } from './analysis.factory';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';

@Processor({ name: 'analysis', concurrency: 5 })
export class AnalysisProcessor extends WorkerHost {
    private readonly logger = new Logger(AnalysisProcessor.name);

    constructor(
        private prisma: PrismaService,
        private historyService: HistoryService,
        private agentFactory: AnalysisAgentFactory,
        private eventsGateway: EventsGateway,
        private usersService: UsersService,
    ) {
        super();
    }

    async process(job: Job<{ dto: GenerateAnalysisDto; userId: string }>): Promise<any> {
        const { dto, userId } = job.data;
        this.logger.log(`Processing analysis job ${job.id} for user ${userId}`);

        try {
            // Execute the AI generation
            const result = await this.generateAnalysis(dto, userId);

            this.logger.log(`Completed analysis job ${job.id}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed analysis job ${job.id}:`, error);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed successfully`);

        // Emit WebSocket event for job completion
        const { dto } = job.data;
        try {
            this.eventsGateway.server.emit(`job:${job.id}:completed`, {
                jobId: job.id,
                status: 'completed',
                result: job.returnvalue,
                ventureId: dto.ventureId,
            });
        } catch (e) {
            this.logger.warn(`Failed to emit job completion event for ${job.id}`, e);
        }
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed:`, error.message);

        // Emit WebSocket event for job failure
        const { dto } = job.data;
        try {
            this.eventsGateway.server.emit(`job:${job.id}:failed`, {
                jobId: job.id,
                status: 'failed',
                error: error.message,
                ventureId: dto.ventureId,
            });
        } catch (e) {
            this.logger.warn(`Failed to emit job failure event for ${job.id}`, e);
        }
    }

    private async generateAnalysis(dto: GenerateAnalysisDto, userId: string) {
        let schema = dto.responseSchema;
        let promptKey = dto.prompt;

        if (!promptKey) {
            schema = { type: 'OBJECT' as any, properties: { result: { type: 'STRING' as any } } };
            promptKey = `Analyze: ${dto.description}`;
        }

        // Check Credits
        if (userId !== 'dev-test-user-id') {
            await this.usersService.checkAndDeductCredits(userId);
        }

        this.emitLog(dto.ventureId, 'Systems Architect', 'agentLogAnalyzingContext');

        // Security & Access Check
        const venture = await (this.prisma as any).venture.findUnique({
            where: { id: dto.ventureId }
        });

        if (!venture) {
            await (this.prisma as any).venture.create({
                data: {
                    id: dto.ventureId,
                    name: 'My Venture',
                    userId: userId
                }
            });
        } else {
            const isOwner = venture.userId === userId;
            let isMember = false;

            if (!isOwner) {
                const member = await (this.prisma as any).ventureMember.findUnique({
                    where: {
                        ventureId_userId: {
                            ventureId: dto.ventureId,
                            userId: userId
                        }
                    }
                });
                isMember = !!member;
            }

            if (!isOwner && !isMember && userId !== 'dev-test-user-id') {
                throw new Error('Venture ID mismatch or unauthorized access.');
            }
        }

        // Context Hydration
        let context = "";
        let finalPrompt = promptKey;
        let refinementSystemInstruction = "";

        if (dto.refinementInstruction && dto.parentAnalysisId) {
            const parentAnalysis = await (this.prisma as any).analysis.findUnique({
                where: { id: dto.parentAnalysisId }
            });

            if (!parentAnalysis) throw new Error("Parent analysis for refinement not found.");

            finalPrompt = `
        CONTEXT - ORIGINAL BUSINESS DESCRIPTION:
        "${dto.description}"

        CONTEXT - PREVIOUS ANALYSIS RESULT (JSON):
        ${JSON.stringify(parentAnalysis.resultData)}

        USER REFINEMENT REQUEST:
        "${dto.refinementInstruction}"

        TASK:
        Regenerate the analysis. Start with the "PREVIOUS ANALYSIS RESULT" as your baseline.
        Modify, update, or expand it based STRICTLY on the "USER REFINEMENT REQUEST".
        Keep the same JSON structure/schema as the previous result.
      `;

            refinementSystemInstruction = `
        You are an expert business consultant iterating on a draft.
        Your goal is to modify the existing analysis to better fit the user's specific feedback.
        Do not lose valuable information from the previous result unless the refinement contradicts it.
      `;
        } else {
            this.emitLog(dto.ventureId, 'Lead Strategist', 'agentLogIdentifyingFactors');
            context = await this.getVentureContext(dto.ventureId, dto.tool);
        }

        // Agent Selection & Execution
        this.emitLog(dto.ventureId, 'Lead Strategist', 'agentLogSynthesizing');
        const agent = this.agentFactory.getAgent(dto.module, dto.tool);

        const baseSystemInstruction = `
You are the ATLAS AI Engine, a Lead Venture Architect and Tier-1 Strategy Consultant.
Your objective is to build a coherent, viable, and scalable business case for the user.

### CORE DIRECTIVES:
1. **Strategic Consistency:** Your output MUST align with the provided <venture_memory_bank>. 
2. **Data-Driven Realism:** Avoid generic fluff. Use specific numbers, KPIs, and industry benchmarks where possible.
3. **Critical Thinking:** Do not just agree with the user's description.
4. **Structured Output:** You must return valid JSON conforming strictly to the requested schema.
`;

        const effectiveSystemInstruction = refinementSystemInstruction
            ? `${baseSystemInstruction}\n\n${refinementSystemInstruction}`
            : baseSystemInstruction;

        this.emitLog(dto.ventureId, 'Market Researcher', 'agentLogScanningMarket');

        const response = await agent.generate(
            finalPrompt,
            context,
            schema,
            effectiveSystemInstruction,
            dto.images
        );

        // Persistence
        this.emitLog(dto.ventureId, 'Systems Architect', 'agentLogFinalizingOutput');
        const savedRecord = await (this.prisma as any).analysis.create({
            data: {
                ventureId: dto.ventureId,
                userId: userId,
                module: dto.module,
                tool: dto.tool,
                inputContext: dto.refinementInstruction ? `Refinement: ${dto.refinementInstruction}` : dto.description,
                resultData: response.data,
                parentId: dto.parentAnalysisId || undefined
            }
        });

        return {
            ...response.data,
            id: savedRecord.id
        };
    }

    private async getVentureContext(ventureId: string, currentTool: string): Promise<string> {
        try {
            const history = await this.historyService.getRecentAnalysesForContext(ventureId, currentTool);

            if (!history || history.length === 0) return "";

            const contextRecords = history.map(record => {
                const dataString = JSON.stringify(record.resultData);
                const truncatedData = dataString.length > 4000
                    ? dataString.substring(0, 4000) + "...(truncated)"
                    : dataString;

                return `
    <historical_artifact type="${record.tool}" date="${record.createdAt}">
        ${truncatedData}
    </historical_artifact>`;
            }).join('\n');

            return `
<venture_memory_bank>
    <instruction>
        The following XML block contains previous analyses generated for this specific venture. 
        You MUST treat this as established fact.
    </instruction>
    ${contextRecords}
</venture_memory_bank>
`;
        } catch (error) {
            this.logger.warn("Failed to fetch venture context", error);
            return "";
        }
    }

    private emitLog(ventureId: string, agent: string, messageKey: string) {
        try {
            this.eventsGateway.emitLog(ventureId, {
                id: Math.random().toString(36).substr(2, 9),
                agent: agent,
                messageKey: messageKey,
                timestamp: Date.now()
            });
        } catch (e) {
            this.logger.warn("Failed to emit agent log via WebSocket", e);
        }
    }
}
