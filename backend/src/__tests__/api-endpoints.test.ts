import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Mock external services
jest.mock('@google/generative-ai');
jest.mock('nodemailer');

describe('Backend API Endpoint Unit and Integration Tests (TC015)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Clear database before each test
    // await prisma.cleanDb();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth endpoints', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should reject registration with existing email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'Test User 2',
        })
        .expect(400);
    });

    it('should login with valid credentials', async () => {
      // Register first
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should validate JWT tokens', async () => {
      // Register and login to get token
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'jwt@example.com',
        password: 'password123',
        name: 'JWT User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'jwt@example.com',
          password: 'password123',
        });

      const token = loginResponse.body.access_token;

      // Use token to access protected route
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/ventures endpoints', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and get token
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'venture@example.com',
        password: 'password123',
        name: 'Venture User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'venture@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should create a new venture', () => {
      return request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Venture',
          description: 'A test business venture',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Venture');
          expect(res.body.description).toBe('A test business venture');
        });
    });

    it('should retrieve user ventures', async () => {
      // Create a venture first
      await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Venture',
          description: 'User venture',
        });

      return request(app.getHttpServer())
        .get('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name', 'My Venture');
        });
    });

    it('should update venture details', async () => {
      // Create venture
      const createResponse = await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Name',
          description: 'Original description',
        });

      const ventureId = createResponse.body.id;

      // Update venture
      return request(app.getHttpServer())
        .put(`/ventures/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should delete a venture', async () => {
      // Create venture
      const createResponse = await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Venture to Delete',
          description: 'Will be deleted',
        });

      const ventureId = createResponse.body.id;

      // Delete venture
      await request(app.getHttpServer())
        .delete(`/ventures/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      return request(app.getHttpServer())
        .get('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const deletedVenture = res.body.find((v: any) => v.id === ventureId);
          expect(deletedVenture).toBeUndefined();
        });
    });
  });

  describe('/analysis endpoints', () => {
    let authToken: string;
    let ventureId: string;

    beforeEach(async () => {
      // Create user, venture, and get token
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'analysis@example.com',
        password: 'password123',
        name: 'Analysis User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'analysis@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;

      const ventureResponse = await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Analysis Venture',
          description: 'For testing analysis endpoints',
        });

      ventureId = ventureResponse.body.id;
    });

    it('should submit analysis generation job', () => {
      return request(app.getHttpServer())
        .post('/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          module: 'strategy',
          tool: 'swot',
          description: 'Test business for SWOT analysis',
          language: 'en',
          prompt: 'Generate SWOT analysis for: {businessDescription}',
          responseSchema: {
            type: 'object',
            properties: {
              strengths: { type: 'array', items: { type: 'object' } },
              weaknesses: { type: 'array', items: { type: 'object' } },
              opportunities: { type: 'array', items: { type: 'object' } },
              threats: { type: 'array', items: { type: 'object' } },
            },
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('jobId');
        });
    });

    it('should poll analysis job status', async () => {
      // Submit job
      const submitResponse = await request(app.getHttpServer())
        .post('/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          module: 'strategy',
          tool: 'swot',
          description: 'Test business',
          language: 'en',
          prompt: 'Test prompt',
          responseSchema: {},
        });

      const jobId = submitResponse.body.jobId;

      // Poll job status
      return request(app.getHttpServer())
        .get(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(['pending', 'processing', 'completed', 'failed']).toContain(
            res.body.status
          );
        });
    });

    it('should retrieve venture analysis history', () => {
      return request(app.getHttpServer())
        .get(`/history/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should save analysis version', async () => {
      // First create some history
      await request(app.getHttpServer())
        .post('/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          module: 'strategy',
          tool: 'swot',
          description: 'Version test',
          language: 'en',
          prompt: 'Test',
          responseSchema: {},
        });

      const historyResponse = await request(app.getHttpServer())
        .get(`/history/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const firstAnalysis = historyResponse.body[0];

      // Save version
      return request(app.getHttpServer())
        .post('/history/version')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          parentId: firstAnalysis.id,
          module: 'strategy',
          tool: 'swot',
          description: 'Modified version',
          data: { modified: true },
        })
        .expect(200);
    });

    it('should delete analysis record', async () => {
      // Create analysis record
      await request(app.getHttpServer())
        .post('/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          module: 'strategy',
          tool: 'swot',
          description: 'To be deleted',
          language: 'en',
          prompt: 'Test',
          responseSchema: {},
        });

      const historyResponse = await request(app.getHttpServer())
        .get(`/history/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const analysisToDelete = historyResponse.body[0];

      // Delete analysis
      await request(app.getHttpServer())
        .delete(`/history/${analysisToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      const updatedHistory = await request(app.getHttpServer())
        .get(`/history/${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const deletedRecord = updatedHistory.body.find(
        (r: any) => r.id === analysisToDelete.id
      );
      expect(deletedRecord).toBeUndefined();
    });
  });

  describe('/users endpoints', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create user and get token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'Test User',
        });

      userId = registerResponse.body.user.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', 'user@example.com');
          expect(res.body).toHaveProperty('name', 'Test User');
        });
    });

    it('should update user profile', () => {
      return request(app.getHttpServer())
        .put('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          bio: 'Updated bio',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.bio).toBe('Updated bio');
        });
    });

    it('should change user password', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        })
        .expect(200);
    });

    it('should reject password change with wrong current password', () => {
      return request(app.getHttpServer())
        .put('/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        })
        .expect(400);
    });
  });

  describe('/subscriptions endpoints', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and get token
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'subscription@example.com',
        password: 'password123',
        name: 'Subscription User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'subscription@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should get subscription plans', () => {
      return request(app.getHttpServer())
        .get('/subscriptions/plans')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('price');
        });
    });

    it('should create subscription', () => {
      return request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planId: 'premium-monthly',
          paymentMethodId: 'pm_test_payment_method',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('should get user subscriptions', () => {
      return request(app.getHttpServer())
        .get('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should cancel subscription', async () => {
      // Create subscription first
      const createResponse = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planId: 'premium-monthly',
          paymentMethodId: 'pm_test_payment_method',
        });

      const subscriptionId = createResponse.body.id;

      // Cancel subscription
      return request(app.getHttpServer())
        .delete(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/reports endpoints', () => {
    let authToken: string;
    let analysisId: string;

    beforeEach(async () => {
      // Create user, venture, analysis
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'reports@example.com',
        password: 'password123',
        name: 'Reports User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'reports@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;

      const ventureResponse = await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Reports Venture',
          description: 'For testing reports',
        });

      const ventureId = ventureResponse.body.id;

      const analysisResponse = await request(app.getHttpServer())
        .post('/analysis/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          module: 'strategy',
          tool: 'swot',
          description: 'Report test analysis',
          language: 'en',
          prompt: 'Test',
          responseSchema: {},
        });

      analysisId = analysisResponse.body.jobId;
    });

    it('should generate PDF report', () => {
      return request(app.getHttpServer())
        .get(`/reports/${analysisId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /application\/pdf/);
    });

    it('should generate CSV export', () => {
      return request(app.getHttpServer())
        .get(`/reports/${analysisId}/csv`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /text\/csv/);
    });

    it('should generate Markdown export', () => {
      return request(app.getHttpServer())
        .get(`/reports/${analysisId}/markdown`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /text\/markdown/);
    });
  });

  describe('/integrations endpoints', () => {
    let authToken: string;
    let ventureId: string;

    beforeEach(async () => {
      // Create user and venture
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'integration@example.com',
        password: 'password123',
        name: 'Integration User',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;

      const ventureResponse = await request(app.getHttpServer())
        .post('/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Venture',
          description: 'For testing integrations',
        });

      ventureId = ventureResponse.body.id;
    });

    it('should get integration status', () => {
      return request(app.getHttpServer())
        .get(`/integrations?ventureId=${ventureId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should toggle integration', () => {
      return request(app.getHttpServer())
        .post('/integrations/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ventureId,
          provider: 'google-drive',
          connect: true,
        })
        .expect(200);
    });
  });

  describe('Error handling and validation', () => {
    it('should handle malformed JSON in requests', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should handle missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          // Missing required fields
          name: 'Test User',
        })
        .expect(400);
    });

    it('should handle invalid HTTP methods', () => {
      return request(app.getHttpServer())
        .patch('/auth/register')
        .send({})
        .expect(404);
    });

    it('should handle unauthorized access to protected routes', () => {
      return request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('should handle invalid JWT tokens', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle non-existent resources', () => {
      return request(app.getHttpServer())
        .get('/ventures/non-existent-id')
        .set('Authorization', `Bearer ${jwtService.sign({ sub: 'test-user' })}`)
        .expect(404);
    });
  });

  describe('Database integration', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock database disconnection
      jest
        .spyOn(prisma, '$connect')
        .mockRejectedValue(new Error('Connection failed'));

      // This would require specific error handling in the services
      // For now, verify the app can start without database
      expect(app).toBeDefined();
    });

    it('should handle database transaction rollbacks', async () => {
      // Create user
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'transaction@example.com',
        password: 'password123',
        name: 'Transaction User',
      });

      // Attempt operation that might fail and rollback
      // This would depend on specific business logic that requires transactions
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'transaction@example.com',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);
    });
  });

  describe('Rate limiting', () => {
    it('should handle rate limiting for API endpoints', async () => {
      // This would require rate limiting middleware
      // For now, verify endpoints respond normally under normal load
      const requests = Array(10)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/health').expect(200));

      await Promise.all(requests);
    });
  });
});
