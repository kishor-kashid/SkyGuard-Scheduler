import { Request, Response, NextFunction } from 'express';
import { hashPassword, comparePassword, generateToken } from '../services/authService';
import { LoginRequest, RegisterRequest, AuthResponse, AppError, UserRole, TrainingLevel } from '../types';
import prisma from '../config/database';

/**
 * Register a new user
 */
export async function register(
  req: Request<{}, {}, RegisterRequest>,
  res: Response<{ success: true; data: AuthResponse }>,
  next: NextFunction
) {
  try {
    const { email, password, name, role = UserRole.STUDENT, phone, trainingLevel } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and associated profile based on role
    let user;
    if (role === UserRole.STUDENT) {
      if (!trainingLevel) {
        throw new AppError('Training level is required for students', 400);
      }

      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          student: {
            create: {
              name,
              phone,
              trainingLevel: trainingLevel as TrainingLevel,
            },
          },
        },
        include: {
          student: true,
        },
      });
    } else if (role === UserRole.INSTRUCTOR) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          instructor: {
            create: {
              name,
              phone,
            },
          },
        },
        include: {
          instructor: true,
        },
      });
    } else {
      // Admin
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return response
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.student?.name || user.instructor?.name || undefined,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(
  req: Request<{}, {}, LoginRequest>,
  res: Response<{ success: true; data: AuthResponse }>,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        instructor: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return response
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.student?.name || user.instructor?.name || undefined,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(
  req: Request,
  res: Response<{ success: true; data: { user: any } }>,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        student: true,
        instructor: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            phone: true,
            trainingLevel: true,
            availability: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            phone: true,
            certifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          name: user.student?.name || user.instructor?.name || undefined,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

