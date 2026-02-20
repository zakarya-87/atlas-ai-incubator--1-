import { Logger } from '@nestjs/common';
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  FRONTEND_URL: z.string().url().optional(),
  JWT_SECRET: z
    .string()
    .min(20, 'JWT_SECRET must be at least 20 characters.')
    .nonempty(),
  JWT_TTL: z.string().default('15m'),
  GEMINI_API_KEY: z.string().nonempty('GEMINI_API_KEY is required'),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Redis / BullMQ
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TLS: z.enum(['true', 'false']).default('false'),
  // AI Providers
  DEFAULT_AI_PROVIDER: z.enum(['gemini', 'grok', 'mistral']).default('mistral'),
  GROK_API_KEY: z.string().optional(),
  GROK_MODEL: z.string().default('grok-beta'),
  MISTRAL_API_KEY: z.string().optional(),
  MISTRAL_MODEL: z.string().default('mistral-large-latest'),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash-lite'),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  const logger = new Logger('EnvValidation');
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    logger.error('Environment validation failed:', parsed.error.format());
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
}
