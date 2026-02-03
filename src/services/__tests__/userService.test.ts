/**
 * userService.test.ts
 * Unit tests for user service
 */

import * as userService from '../userService';
import { createMockUser, createMockPrismaClient } from '@/__tests__/setup';

jest.mock('@/lib/db', () => ({
  prisma: createMockPrismaClient(),
}));

describe('userService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = require('@/lib/db').prisma;
  });

  describe('getUserById', () => {
    it('should return a user by ID with addresses and quotes', async () => {
      const mockUser = createMockUser({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { addresses: true, quotes: true },
      });
    });

    it('should return null for non-existent user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(userService.getUserById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getUserByPhone', () => {
    it('should return a user by phone number', async () => {
      const mockUser = createMockUser({
        id: '1',
        name: 'Test User',
      });

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.getUserByPhone('1234567890');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { phone: '1234567890' },
      });
    });

    it('should return null for non-existent phone', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const result = await userService.getUserByPhone('0000000000');

      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        createMockUser({ id: '1', name: 'User 1' }),
        createMockUser({ id: '2', name: 'User 2' }),
      ];

      (mockPrisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await userService.getAllUsers(10, 0);

      expect(result).toHaveLength(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should use default limit of 50', async () => {
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValueOnce([]);

      await userService.getAllUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
        })
      );
    });

    it('should handle pagination', async () => {
      const mockUsers = [createMockUser({ id: '3' })];

      (mockPrisma.user.findMany as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await userService.getAllUsers(10, 20);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users exist', async () => {
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const mockUser = createMockUser({
        id: '1',
        isActive: false,
      });

      (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await userService.deactivateUser(1);

      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
    });

    it('should handle deactivation of non-existent user', async () => {
      (mockPrisma.user.update as jest.Mock).mockRejectedValueOnce(
        new Error('User not found')
      );

      await expect(userService.deactivateUser(999)).rejects.toThrow('User not found');
    });

    it('should handle database errors during deactivation', async () => {
      (mockPrisma.user.update as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(userService.deactivateUser(1)).rejects.toThrow('Database error');
    });
  });
});
