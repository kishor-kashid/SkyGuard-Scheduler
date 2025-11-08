import { Request, Response, NextFunction } from 'express';
import { register, login } from '../../controllers/auth.controller';
import prisma from '../../config/database';
import { hashPassword } from '../../services/authService';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../services/authService', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new student successfully', async () => {
      const { generateToken } = require('../../services/authService');
      
      mockRequest.body = {
        email: 'newstudent@example.com',
        password: 'password123',
        name: 'New Student',
        role: 'STUDENT',
        trainingLevel: 'STUDENT_PILOT',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'newstudent@example.com',
        role: 'STUDENT',
        student: {
          id: 1,
          name: 'New Student',
          trainingLevel: 'STUDENT_PILOT',
        },
      });
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newstudent@example.com' },
      });
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return error if email already exists', async () => {
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('already exists');
    });

    it('should return error if required fields are missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        // Missing password and name
      };

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('required');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const { comparePassword, generateToken } = require('../../services/authService');
      
      mockRequest.body = {
        email: 'student@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'student@example.com',
        passwordHash: 'hashedPassword',
        role: 'STUDENT',
        student: {
          id: 1,
          name: 'Test Student',
        },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return error for invalid email', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid');
    });

    it('should return error for incorrect password', async () => {
      const { comparePassword } = require('../../services/authService');
      
      mockRequest.body = {
        email: 'student@example.com',
        password: 'wrongpassword',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'student@example.com',
        passwordHash: 'hashedPassword',
      });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toContain('Invalid');
    });
  });
});

