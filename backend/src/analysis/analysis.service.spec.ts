
import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryService } from '../history/history.service';
import { AnalysisAgentFactory } from './analysis.factory';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';
import { ForbiddenException } from '@nestjs/common';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let prismaService: any;
  let historyService: any;
  let agentFactory: any;
  let eventsGateway: any;
  let usersService: any;

  const mockUser = { id: 'user-123' };
  const mockVenture = { id: 'venture-123', userId: 'user-123' };

  const mockDto: GenerateAnalysisDto = {
    ventureId: 'venture-123',
    module: 'strategy',
    tool: 'swot',
    description: 'A test business',
    language: 'en',
  };

  const mockAgent = {
    generate: jest.fn().mockResolvedValue({
      text: '{"result": "ok"}',
      data: { result: 'ok' },
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    // Mock implementations
    prismaService = {
      venture: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      ventureMember: {
        findUnique: jest.fn(),
      },
      analysis: {
        create: jest.fn().mockResolvedValue({ id: 'analysis-123' }),
      },
    };

    historyService = {
      getRecentAnalysesForContext: jest.fn().mockResolvedValue([]),
    };

    agentFactory = {
      getAgent: jest.fn().mockReturnValue(mockAgent),
    };

    eventsGateway = {
      emitLog: jest.fn(),
    };

    usersService = {
      checkAndDeductCredits: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: PrismaService, useValue: prismaService },
        { provide: HistoryService, useValue: historyService },
        { provide: AnalysisAgentFactory, useValue: agentFactory },
        { provide: EventsGateway, useValue: eventsGateway },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAnalysis', () => {
    it('should generate analysis successfully', async () => {
      // Setup mocks
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);

      // Execute
      const result = await service.generateAnalysis(mockDto, mockUser.id);

      // Verify Flow
      expect(prismaService.venture.findUnique).toHaveBeenCalledWith({ where: { id: mockDto.ventureId } });
      expect(historyService.getRecentAnalysesForContext).toHaveBeenCalledWith(mockDto.ventureId, mockDto.tool);
      expect(agentFactory.getAgent).toHaveBeenCalledWith(mockDto.module, mockDto.tool);
      expect(mockAgent.generate).toHaveBeenCalled();
      expect(prismaService.analysis.create).toHaveBeenCalled();
      expect(eventsGateway.emitLog).toHaveBeenCalled();
      expect(result).toEqual({ result: 'ok', id: 'analysis-123' });
    });

    it('should create a new venture if one does not exist', async () => {
      prismaService.venture.findUnique.mockResolvedValue(null); // No venture found
      prismaService.venture.create.mockResolvedValue(mockVenture);

      await service.generateAnalysis(mockDto, mockUser.id);

      expect(prismaService.venture.create).toHaveBeenCalledWith({
        data: {
          id: mockDto.ventureId,
          name: 'My Venture',
          userId: mockUser.id
        }
      });
    });

    it('should throw ForbiddenException if user does not own venture', async () => {
      prismaService.venture.findUnique.mockResolvedValue({
        id: 'venture-123',
        userId: 'other-user-id' // Different owner
      });

      await expect(service.generateAnalysis(mockDto, mockUser.id))
        .rejects
        .toThrow(ForbiddenException);
    });

    it('should inject context into the agent prompt', async () => {
      prismaService.venture.findUnique.mockResolvedValue(mockVenture);
      historyService.getRecentAnalysesForContext.mockResolvedValue([
        { tool: 'pestel', createdAt: new Date(), resultData: { data: 'old-data' } }
      ]);

      await service.generateAnalysis(mockDto, mockUser.id);

      // Verify that the second argument to generate (which is context) contains the historical data
      const generateCallArgs = mockAgent.generate.mock.calls[0];
      expect(generateCallArgs[1]).toContain('pestel');
      expect(generateCallArgs[1]).toContain('old-data');
    });
  });
});