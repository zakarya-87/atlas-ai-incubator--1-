import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
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
    // Rate Limiting — global defaults + named 'auth' limit for login/register
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,    // 1 minute window
        limit: 100,    // max 100 requests per IP per minute (global)
      },
      {
        name: 'auth',
        ttl: 60000,    // 1 minute window
        limit: 5,      // max 5 auth requests per IP per minute
      },
    ]),
    // Global BullMQ Redis connection — shared by all queues
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST') ?? 'localhost',
          port: config.get<number>('REDIS_PORT') ?? 6379,
          password: config.get<string>('REDIS_PASSWORD'),
          tls: config.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
        },
      }),
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
