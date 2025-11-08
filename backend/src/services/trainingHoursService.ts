import prisma from '../config/database';
import { TrainingHoursCategory } from '@prisma/client';
import { AppError } from '../types';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Log training hours for a student
 */
export async function logTrainingHours(
  studentId: number,
  hours: number,
  category: TrainingHoursCategory,
  date: Date,
  instructorId?: number,
  flightId?: number,
  notes?: string
) {
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  // Verify flight exists if provided
  if (flightId) {
    const flight = await prisma.flightBooking.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }
  }

  return prisma.trainingHours.create({
    data: {
      studentId,
      flightId: flightId || null,
      hours: new Decimal(hours),
      category,
      date,
      instructorId: instructorId || null,
      notes: notes || null,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      flight: {
        select: {
          id: true,
          scheduledDate: true,
        },
      },
      instructor: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get training hours for a student
 */
export async function getStudentHours(studentId: number) {
  return prisma.trainingHours.findMany({
    where: { studentId },
    include: {
      flight: {
        select: {
          id: true,
          scheduledDate: true,
          status: true,
        },
      },
      instructor: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Get total training hours for a student
 */
export async function getTotalHours(studentId: number): Promise<number> {
  const hours = await prisma.trainingHours.findMany({
    where: { studentId },
    select: {
      hours: true,
    },
  });

  return hours.reduce((total, record) => {
    return total + parseFloat(record.hours.toString());
  }, 0);
}

/**
 * Get training hours by category
 */
export async function getHoursByCategory(studentId: number) {
  const hours = await prisma.trainingHours.findMany({
    where: { studentId },
    select: {
      category: true,
      hours: true,
    },
  });

  const totals: Record<TrainingHoursCategory, number> = {
    GROUND: 0,
    FLIGHT: 0,
    SIMULATOR: 0,
  };

  hours.forEach((record) => {
    totals[record.category] += parseFloat(record.hours.toString());
  });

  return totals;
}

/**
 * Get training hours by date range
 */
export async function getHoursByDateRange(
  studentId: number,
  startDate: Date,
  endDate: Date
) {
  return prisma.trainingHours.findMany({
    where: {
      studentId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      flight: {
        select: {
          id: true,
          scheduledDate: true,
        },
      },
      instructor: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });
}

/**
 * Get training hours summary with statistics
 */
export async function getTrainingHoursSummary(studentId: number) {
  const allHours = await getStudentHours(studentId);
  const totalHours = await getTotalHours(studentId);
  const hoursByCategory = await getHoursByCategory(studentId);

  return {
    totalHours,
    hoursByCategory,
    records: allHours.map((record) => ({
      ...record,
      hours: record.hours.toNumber(), // Convert Decimal to number
    })),
    recordCount: allHours.length,
  };
}

