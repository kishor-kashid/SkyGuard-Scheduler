import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError, CreateStudentRequest, UpdateStudentRequest, TrainingLevel } from '../types';

/**
 * Create a new student
 * Note: This creates both a User and Student record
 */
export async function createStudent(
  req: Request<{}, {}, CreateStudentRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name, phone, trainingLevel, availability } = req.body;

    // Validate required fields
    if (!email || !password || !name || !trainingLevel) {
      throw new AppError('Missing required fields: email, password, name, and trainingLevel are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate training level
    if (!Object.values(TrainingLevel).includes(trainingLevel)) {
      throw new AppError('Invalid training level', 400);
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

    // Create user and student in a transaction
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'STUDENT',
        student: {
          create: {
            name,
            phone: phone || null,
            trainingLevel,
            availability: availability ? JSON.stringify(availability) : null,
          },
        },
      },
      include: {
        student: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        student: {
          id: user.student!.id,
          userId: user.id,
          name: user.student!.name,
          phone: user.student!.phone,
          trainingLevel: user.student!.trainingLevel,
          availability: user.student!.availability,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all students
 * Admins can see all students, instructors can see their assigned students
 */
export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    let students;

    if (user?.role === 'ADMIN') {
      // Admins can see all students
      students = await prisma.student.findMany({
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
    } else if (user?.role === 'INSTRUCTOR') {
      // Instructors can see students they have flights with
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });

      if (!instructor) {
        throw new AppError('Instructor profile not found', 404);
      }

      // Get unique students from flights
      const flights = await prisma.flightBooking.findMany({
        where: {
          instructorId: instructor.id,
        },
        select: {
          studentId: true,
        },
        distinct: ['studentId'],
      });

      const studentIds = flights.map((f) => f.studentId);

      students = await prisma.student.findMany({
        where: {
          id: {
            in: studentIds,
          },
        },
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
    } else {
      throw new AppError('Access denied', 403);
    }

    // Format response
    const formattedStudents = students.map((student) => ({
      id: student.id,
      userId: student.userId,
      name: student.name,
      phone: student.phone,
      trainingLevel: student.trainingLevel,
      availability: student.availability ? JSON.parse(student.availability) : null,
      email: student.user.email,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    }));

    res.json({
      success: true,
      data: formattedStudents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single student by ID
 */
export async function getStudentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user;

    const student = await prisma.student.findUnique({
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

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Check authorization
    if (user?.role === 'STUDENT') {
      // Students can only see their own profile
      const studentProfile = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (studentProfile && student.id !== studentProfile.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (user?.role === 'INSTRUCTOR') {
      // Instructors can see students they have flights with
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });
      if (instructor) {
        const hasFlights = await prisma.flightBooking.findFirst({
          where: {
            studentId: student.id,
            instructorId: instructor.id,
          },
        });
        if (!hasFlights) {
          throw new AppError('Access denied', 403);
        }
      }
    }

    res.json({
      success: true,
      data: {
        id: student.id,
        userId: student.userId,
        name: student.name,
        phone: student.phone,
        trainingLevel: student.trainingLevel,
        availability: student.availability ? JSON.parse(student.availability) : null,
        email: student.user.email,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a student
 */
export async function updateStudent(
  req: Request<{ id: string }, {}, UpdateStudentRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { name, phone, trainingLevel, availability } = req.body;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStudent) {
      throw new AppError('Student not found', 404);
    }

    // Check authorization
    if (user?.role === 'STUDENT') {
      // Students can only update their own profile
      const studentProfile = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (studentProfile && existingStudent.id !== studentProfile.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (user?.role !== 'ADMIN') {
      // Only admins can update other students
      throw new AppError('Access denied', 403);
    }

    // Validate training level if provided
    if (trainingLevel && !Object.values(TrainingLevel).includes(trainingLevel)) {
      throw new AppError('Invalid training level', 400);
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (trainingLevel !== undefined) updateData.trainingLevel = trainingLevel;
    if (availability !== undefined) {
      updateData.availability = availability ? JSON.stringify(availability) : null;
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedStudent.id,
        userId: updatedStudent.userId,
        name: updatedStudent.name,
        phone: updatedStudent.phone,
        trainingLevel: updatedStudent.trainingLevel,
        availability: updatedStudent.availability ? JSON.parse(updatedStudent.availability) : null,
        email: updatedStudent.user.email,
        createdAt: updatedStudent.createdAt,
        updatedAt: updatedStudent.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a student
 * Note: This will also delete the associated user (cascade delete)
 */
export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Only admins can delete students
    if (user?.role !== 'ADMIN') {
      throw new AppError('Access denied. Only admins can delete students.', 403);
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        flights: {
          where: {
            status: {
              in: ['CONFIRMED', 'WEATHER_HOLD'],
            },
          },
        },
      },
    });

    if (!existingStudent) {
      throw new AppError('Student not found', 404);
    }

    // Check if student has active flights
    if (existingStudent.flights.length > 0) {
      throw new AppError(
        'Cannot delete student with active flights. Please cancel or complete all flights first.',
        409
      );
    }

    // Delete student (this will cascade delete the user)
    await prisma.student.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      data: {
        message: 'Student deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

