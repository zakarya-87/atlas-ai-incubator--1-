
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createPrismaMock = (): MockPrismaClient => {
    return mockDeep<PrismaClient>();
};

/**
 * Standardizes common mock results for Prisma entities
 */
export const prismaMockDefaults = {
    user: {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
    },
    venture: {
        id: 'venture-123',
        name: 'Test Venture',
        userId: 'user-123',
    },
    analysis: {
        id: 'analysis-123',
        ventureId: 'venture-123',
        userId: 'user-123',
        module: 'strategy',
        tool: 'swot',
        data: '{}',
        createdAt: new Date(),
    }
};
