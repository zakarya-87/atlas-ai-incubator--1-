import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisAgentFactory } from './analysis.factory';
import { DefaultAgent } from './agents/default.agent';
import { ResearchAgent } from './agents/research.agent';
import { DesignAgent } from './agents/design.agent';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { AnalysisProcessor } from './analysis.processor';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { GrokProvider } from './providers/grok.provider';
import { MistralProvider } from './providers/mistral.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HistoryModule,
    UsersModule,
    EventsModule,
    HealthModule,
    // Connection is inherited from BullModule.forRootAsync() in AppModule
    BullModule.registerQueue({ name: 'analysis-queue' }),
  ],
  controllers: [AnalysisController, AnalyticsController, JobsController],
  providers: [
    AnalysisService,
    JobsService,
    AnalysisProcessor,
    AnalysisAgentFactory,
    DefaultAgent,
    ResearchAgent,
    DesignAgent,
    GrokProvider,
    MistralProvider,
    OpenAIProvider,
    AIProviderFactory,
  ],
  exports: [AnalysisService, AIProviderFactory],
})
export class AnalysisModule { }
