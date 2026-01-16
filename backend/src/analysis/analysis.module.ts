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

@Module({
  imports: [PrismaModule, HistoryModule, UsersModule, EventsModule],
  controllers: [AnalysisController, JobsController],
  providers: [
    AnalysisService,
    AnalysisAgentFactory,
    DefaultAgent,
    ResearchAgent,
    DesignAgent,
  ],
  exports: [AnalysisService],
})
export class AnalysisModule {}