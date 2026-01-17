
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
        await (this as any).$connect();
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('FAILED to connect to Database (SQLite). Check if "backend/dev.db" exists and is writable.', error);
        // We do not throw here to allow the server to start and respond with 500s instead of crashing
    }
  }

  async onModuleDestroy() {
    await (this as any).$disconnect();
  }
}
