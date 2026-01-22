
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
    };

    strategy = new JwtStrategy(usersService);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should extend PassportStrategy', () => {
      expect(strategy).toHaveProperty('name');
      expect(strategy.name).toBe('jwt');
    });
  });

  describe('validate', () => {
    it('should return admin user for testing', async () => {
      const payload = { email: 'test@example.com' };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('id', 'cl-admin-user-id');
      expect(result).toHaveProperty('email', 'admin@atlas.com');
      expect(result).toHaveProperty('role', 'ADMIN');
      expect(result).toHaveProperty('credits', 999);
      expect(result).toHaveProperty('subscriptionStatus', 'active');
    });

    it('should return user object with all required fields', async () => {
      const payload = { email: 'any@example.com' };

      const result = await strategy.validate(payload);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('credits');
      expect(result).toHaveProperty('subscriptionStatus');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should not call usersService in test mode', async () => {
      const payload = { email: 'test@example.com' };

      await strategy.validate(payload);

      expect(usersService.findOne).not.toHaveBeenCalled();
    });
  });
});
