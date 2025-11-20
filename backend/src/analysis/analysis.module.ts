

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { HistoryModule } from '../history/history.module';
import { AnalysisAgentFactory } from './analysis.factory';
import { DefaultAgent } from './agents/default.agent';
import { ResearchAgent } from './agents/research.agent';
import { DesignAgent } from './agents/design.agent';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';
import { AnalysisProcessor } from './analysis.processor';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [
    HistoryModule,
    EventsModule,
    UsersModule,
    BullModule.registerQueue({
      name: 'analysis',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // 1 hour
        },
        removeOnFail: {
          age: 86400, // 24 hours
        },
      },
    }),
  ],
  controllers: [AnalysisController, JobsController],
  providers: [
    AnalysisService,
    AnalysisAgentFactory,
    AnalysisProcessor,
    JobsService,
    DefaultAgent,
    ResearchAgent,
    DesignAgent,
  ],
})
export class AnalysisModule { }
