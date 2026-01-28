import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;
  let mockConfigService: any;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-123' }),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_USER: 'test@test.com',
          SMTP_PASS: 'testpass',
          SMTP_PORT: '587',
          FRONTEND_URL: 'http://localhost:5173',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    // Manually set the transporter since constructor runs during module creation
    (service as any).transporter = mockTransporter;
    (service as any).isDev = false;
  });

  describe('constructor', () => {
    it('should create service with SMTP credentials', async () => {
      const configWithSmtp = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            SMTP_HOST: 'smtp.test.com',
            SMTP_USER: 'user@test.com',
            SMTP_PASS: 'pass123',
            SMTP_PORT: '587',
          };
          return config[key];
        }),
      };

      const testService = new EmailService(configWithSmtp as any);
      expect((testService as any).isDev).toBe(false);
    });

    it('should set isDev to true when SMTP credentials are missing', async () => {
      const configWithoutSmtp = {
        get: jest.fn((key: string) => undefined),
      };

      const testService = new EmailService(configWithoutSmtp as any);
      expect((testService as any).isDev).toBe(true);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct content', async () => {
      const to = 'test@example.com';

      await service.sendWelcomeEmail(to);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"ATLAS AI" <noreply@atlas-incubator.com>',
        to,
        subject: 'Welcome to ATLAS AI Incubator',
        html: expect.stringContaining('Welcome to ATLAS AI'),
      });
    });
  });

  describe('sendInviteEmail', () => {
    it('should send invite email with correct content', async () => {
      const to = 'invitee@example.com';
      const inviterName = 'John Doe';
      const ventureName = 'My Startup';

      await service.sendInviteEmail(to, inviterName, ventureName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"ATLAS AI" <noreply@atlas-incubator.com>',
        to,
        subject: `${inviterName} invited you to join "${ventureName}" on ATLAS`,
        html: expect.stringContaining('Team Invitation'),
      });
    });
  });
});
