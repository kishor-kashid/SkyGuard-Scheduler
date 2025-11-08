import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../types';

interface CreateInstructorRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  certifications?: string | string[];
}

/**
 * Create a new instructor
 * Note: This creates both a User and Instructor record
 * Admin only
 */
export async function createInstructor(
  req: Request<{}, {}, CreateInstructorRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name, phone, certifications } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      throw new AppError('Missing required fields: email, password, and name are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const bcrypt = await import('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    // Format certifications as JSON string
    const certificationsJson = certifications
      ? JSON.stringify(Array.isArray(certifications) ? certifications : [certifications])
      : null;

    // Create user and instructor in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'INSTRUCTOR',
        instructor: {
          create: {
            name,
            phone: phone || null,
            certifications: certificationsJson,
          },
        },
      },
      include: {
        instructor: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        instructor: {
          id: user.instructor!.id,
          userId: user.id,
          name: user.instructor!.name,
          phone: user.instructor!.phone,
          certifications: user.instructor!.certifications
            ? JSON.parse(user.instructor!.certifications)
            : null,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all instructors
 * Admin only
 */
export async function getInstructors(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (user?.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin access required.', 403);
    }

    // Get all instructors
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format response
    const formattedInstructors = instructors.map((instructor) => ({
      id: instructor.id,
      userId: instructor.userId,
      name: instructor.name,
      phone: instructor.phone,
      certifications: instructor.certifications ? JSON.parse(instructor.certifications) : null,
      email: instructor.user.email,
      createdAt: instructor.createdAt,
      updatedAt: instructor.updatedAt,
    }));

    res.json({
      success: true,
      data: formattedInstructors,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single instructor by ID
 * Admin only
 */
export async function getInstructorById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user?.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin access required.', 403);
    }

    const instructor = await prisma.instructor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!instructor) {
      throw new AppError('Instructor not found', 404);
    }

    // Format response
    const formattedInstructor = {
      id: instructor.id,
      userId: instructor.userId,
      name: instructor.name,
      phone: instructor.phone,
      certifications: instructor.certifications ? JSON.parse(instructor.certifications) : null,
      email: instructor.user.email,
      createdAt: instructor.createdAt,
      updatedAt: instructor.updatedAt,
    };

    res.json({
      success: true,
      data: formattedInstructor,
    });
  } catch (error) {
    next(error);
  }
}

