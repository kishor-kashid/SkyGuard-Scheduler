import prisma from '../config/database';
import { FlightHistoryAction } from '@prisma/client';

/**
 * Log a flight action to the history
 */
export async function logFlightAction(
  flightId: number,
  action: FlightHistoryAction,
  changedBy: number,
  changes?: Record<string, any>,
  notes?: string
): Promise<void> {
  await prisma.flightHistory.create({
    data: {
      flightId,
      action,
      changedBy,
      changes: changes ? JSON.stringify(changes) : null,
      notes: notes || null,
    },
  });
}

/**
 * Get flight history for a specific flight
 */
export async function getFlightHistory(flightId: number) {
  return prisma.flightHistory.findMany({
    where: { flightId },
    include: {
      changedByUser: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Get all flight history for a student
 */
export async function getStudentFlightHistory(studentId: number) {
  const flights = await prisma.flightBooking.findMany({
    where: { studentId },
    select: { id: true },
  });

  const flightIds = flights.map((f) => f.id);

  return prisma.flightHistory.findMany({
    where: {
      flightId: {
        in: flightIds,
      },
    },
    include: {
      flight: {
        select: {
          id: true,
          scheduledDate: true,
          status: true,
        },
      },
      changedByUser: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Get all flight history for an instructor
 */
export async function getInstructorFlightHistory(instructorId: number) {
  const flights = await prisma.flightBooking.findMany({
    where: { instructorId },
    select: { id: true },
  });

  const flightIds = flights.map((f) => f.id);

  return prisma.flightHistory.findMany({
    where: {
      flightId: {
        in: flightIds,
      },
    },
    include: {
      flight: {
        select: {
          id: true,
          scheduledDate: true,
          status: true,
        },
      },
      changedByUser: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Format change diffs for display
 */
export function formatChangeDiff(changes: string | null): Record<string, any> | null {
  if (!changes) return null;
  try {
    return JSON.parse(changes);
  } catch {
    return null;
  }
}

