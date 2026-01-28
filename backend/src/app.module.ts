import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnalysisModule } from './analysis/analysis.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';
import { HistoryModule } from './history/history.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { ReportsModule } from './reports/reports.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { VenturesModule } from './ventures/ventures.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnv(config),
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AnalysisModule,
    EmailModule,
    EventsModule,
    HistoryModule,
    IntegrationsModule,
    ReportsModule,
    SubscriptionsModule,
    VenturesModule,
  ],
})
export class AppModule {}
