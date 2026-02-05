import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
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
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { GrokProvider } from './providers/grok.provider';
import { MistralProvider } from './providers/mistral.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIProviderFactory } from './providers/ai-provider.factory';


@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    HistoryModule,
    UsersModule,
    EventsModule,
    BullModule.registerQueue({
      name: 'analysis',
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
  ],
  controllers: [AnalysisController, JobsController],
  providers: [
    AnalysisService,
    JobsService,
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
export class AnalysisModule {}
