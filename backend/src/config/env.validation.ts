import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  FRONTEND_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(20,
    'JWT_SECRET must be at least 20 characters.').nonempty(),
  JWT_TTL: z.string().default('15m'),
  API_KEY: z.string().nonempty('API_KEY is required'),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    console.error('Environment validation failed:', parsed.error.format());
    throw new Error('Invalid environment configuration');
  }
  return parsed.data as any;
}
