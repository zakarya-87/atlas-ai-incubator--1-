
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  describe('constructor', () => {
    it('should create instance', () => {
      expect(service).toBeInstanceOf(PrismaService);
    });

    it('should extend PrismaClient', () => {
      expect(service).toHaveProperty('$connect');
      expect(service).toHaveProperty('$disconnect');
      expect(service).toHaveProperty('user');
      expect(service).toHaveProperty('venture');
      expect(service).toHaveProperty('analysis');
    });
  });

  describe('onModuleInit', () => {
    it('should be defined', () => {
      expect(service.onModuleInit).toBeDefined();
      expect(typeof service.onModuleInit).toBe('function');
    });
  });

  describe('onModuleDestroy', () => {
    it('should be defined', () => {
      expect(service.onModuleDestroy).toBeDefined();
      expect(typeof service.onModuleDestroy).toBe('function');
    });
  });

  describe('database properties', () => {
    it('should have user model', () => {
      expect(service.user).toBeDefined();
      expect(typeof service.user.findUnique).toBe('function');
      expect(typeof service.user.create).toBe('function');
      expect(typeof service.user.update).toBe('function');
      expect(typeof service.user.delete).toBe('function');
      expect(typeof service.user.findMany).toBe('function');
    });

    it('should have venture model', () => {
      expect(service.venture).toBeDefined();
      expect(typeof service.venture.findUnique).toBe('function');
      expect(typeof service.venture.create).toBe('function');
      expect(typeof service.venture.update).toBe('function');
      expect(typeof service.venture.delete).toBe('function');
    });

    it('should have analysis model', () => {
      expect(service.analysis).toBeDefined();
      expect(typeof service.analysis.findUnique).toBe('function');
      expect(typeof service.analysis.create).toBe('function');
      expect(typeof service.analysis.update).toBe('function');
      expect(typeof service.analysis.delete).toBe('function');
      expect(typeof service.analysis.findMany).toBe('function');
    });

    it('should have integration model', () => {
      expect(service.integration).toBeDefined();
      expect(typeof service.integration.findMany).toBe('function');
      expect(typeof service.integration.upsert).toBe('function');
    });
  });
});
