import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AnalysisAgentFactory } from './../src/analysis/analysis.factory';
import { EventsGateway } from './../src/events/events.gateway';
import { JwtService } from '@nestjs/jwt';

declare const describe: any;
declare const beforeEach: any;
declare const afterAll: any;
declare const it: any;
declare const expect: any;
declare const jest: any;

describe('AnalysisController (e2e)', () => {
  let app: INestApplication;
  let prismaService: any;
  let jwtService: JwtService;

  // Mock User matching the JWT Strategy expectation
  const user = { id: 'user-123', email: 'test@example.com', role: 'USER', password: 'hashed_password' };
  
  beforeEach(async () => {
    // Mock Prisma (Database)
    prismaService = {
      user: { 
        findUnique: jest.fn().mockImplementation((args) => {
            if (args.where.email === user.email) return Promise.resolve(user);
            return Promise.resolve(null);
        }) 
      },
      venture: { 
        findUnique: jest.fn().mockResolvedValue({ id: 'v1', userId: user.id }), 
        create: jest.fn() 
      },
      analysis: { create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    };

    // Mock AI Agent Factory (prevent Google API calls)
    const mockAgentFactory = {
      getAgent: jest.fn().mockReturnValue({
        generate: jest.fn().mockResolvedValue({ text: '{"result":"success"}', data: { result: 'success' } })
      })
    };

    // Mock Events Gateway (prevent WebSocket errors)
    const mockEventsGateway = {
        emitLog: jest.fn()
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .overrideProvider(AnalysisAgentFactory)
    .useValue(mockAgentFactory)
    .overrideProvider(EventsGateway)
    .useValue(mockEventsGateway)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/analysis/generate (POST) - should accept requests (auth mocked)', () => {
    return request(app.getHttpServer())
      .post('/analysis/generate')
      .send({ 
        ventureId: 'v1',
        module: 'strategy',
        tool: 'swot',
        description: 'Test Business',
        language: 'en'
      })
      .expect(201);
  });

  it('/analysis/generate (POST) - should succeed with valid DTO', async () => {
    const token = await jwtService.signAsync({ email: user.email }, { secret: 'secretKey' });
    return request(app.getHttpServer())
      .post('/analysis/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ 
        ventureId: 'v1',
        module: 'strategy',
        tool: 'swot',
        description: 'Test Business',
        language: 'en'
      })
      .expect(201);
  });

  it('/analysis/generate (POST) - should return jobId on success', async () => {
    const token = await jwtService.signAsync({ email: user.email }, { secret: 'secretKey' });
    return request(app.getHttpServer())
      .post('/analysis/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ventureId: 'v1',
        module: 'strategy',
        tool: 'swot',
        description: 'Test Business',
        language: 'en'
      })
      .expect(201)
      .expect((res) => {
          expect(res.body.jobId).toBeDefined();
          expect(typeof res.body.jobId).toBe('string');
      });
  });
});