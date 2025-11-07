import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../types';

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

