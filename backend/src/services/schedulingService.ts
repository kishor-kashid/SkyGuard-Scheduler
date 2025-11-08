import prisma from '../config/database';
import { TimeSlot } from '../types';

/**
 * Get available time slots for rescheduling
 * Checks instructor, aircraft, and student availability
 */
export async function getAvailableSlots(
  startDate: Date,
  endDate: Date,
  instructorId: number,
  aircraftId: number,
  studentId?: number,
  excludeFlightId?: number
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];
  const currentDate = new Date(startDate);

  // Generate slots every 2 hours between start and end date
  while (currentDate <= endDate) {
    // Skip past dates
    if (currentDate < new Date()) {
      currentDate.setHours(currentDate.getHours() + 2);
      continue;
    }

    // Check if slot is available
    const isAvailable = await isSlotAvailable(
      currentDate,
      instructorId,
      aircraftId,
      studentId,
      excludeFlightId
    );

    slots.push({
      dateTime: currentDate.toISOString(),
      available: isAvailable.available,
      reason: isAvailable.reason,
    });

    // Move to next slot (2 hours later)
    currentDate.setHours(currentDate.getHours() + 2);
  }

  return slots.filter((slot) => slot.available);
}

/**
 * Check if a specific time slot is available
 */
async function isSlotAvailable(
  dateTime: Date,
  instructorId: number,
  aircraftId: number,
  studentId?: number,
  excludeFlightId?: number
): Promise<{ available: boolean; reason?: string }> {
  // Check instructor availability
  const instructorAvailable = await checkInstructorAvailability(
    dateTime,
    instructorId,
    excludeFlightId
  );
  if (!instructorAvailable.available) {
    return {
      available: false,
      reason: `Instructor: ${instructorAvailable.reason}`,
    };
  }

  // Check aircraft availability
  const aircraftAvailable = await checkAircraftAvailability(
    dateTime,
    aircraftId,
    excludeFlightId
  );
  if (!aircraftAvailable.available) {
    return {
      available: false,
      reason: `Aircraft: ${aircraftAvailable.reason}`,
    };
  }

  // Check student availability (if studentId provided)
  if (studentId) {
    const studentAvailable = await checkStudentAvailability(
      dateTime,
      studentId,
      excludeFlightId
    );
    if (!studentAvailable.available) {
      return {
        available: false,
        reason: `Student: ${studentAvailable.reason}`,
      };
    }
  }

  return { available: true };
}

/**
 * Check if instructor is available at a specific time
 */
export async function checkInstructorAvailability(
  dateTime: Date,
  instructorId: number,
  excludeFlightId?: number
): Promise<{ available: boolean; reason?: string }> {
  // Calculate slot start and end (2 hour window)
  const slotStart = new Date(dateTime);
  const slotEnd = new Date(dateTime);
  slotEnd.setHours(slotEnd.getHours() + 2);

  // Check for conflicting flights
  const conflictingFlight = await prisma.flightBooking.findFirst({
    where: {
      instructorId,
      scheduledDate: {
        gte: slotStart,
        lt: slotEnd,
      },
      status: {
        in: ['CONFIRMED', 'WEATHER_HOLD'],
      },
      ...(excludeFlightId && { id: { not: excludeFlightId } }),
    },
  });

  if (conflictingFlight) {
    return {
      available: false,
      reason: `Instructor has a conflicting flight at ${conflictingFlight.scheduledDate.toISOString()}`,
    };
  }

  return { available: true };
}

/**
 * Check if aircraft is available at a specific time
 */
export async function checkAircraftAvailability(
  dateTime: Date,
  aircraftId: number,
  excludeFlightId?: number
): Promise<{ available: boolean; reason?: string }> {
  // Calculate slot start and end (2 hour window)
  const slotStart = new Date(dateTime);
  const slotEnd = new Date(dateTime);
  slotEnd.setHours(slotEnd.getHours() + 2);

  // Check for conflicting flights
  const conflictingFlight = await prisma.flightBooking.findFirst({
    where: {
      aircraftId,
      scheduledDate: {
        gte: slotStart,
        lt: slotEnd,
      },
      status: {
        in: ['CONFIRMED', 'WEATHER_HOLD'],
      },
      ...(excludeFlightId && { id: { not: excludeFlightId } }),
    },
  });

  if (conflictingFlight) {
    return {
      available: false,
      reason: `Aircraft has a conflicting flight at ${conflictingFlight.scheduledDate.toISOString()}`,
    };
  }

  return { available: true };
}

/**
 * Check if student is available at a specific time
 */
export async function checkStudentAvailability(
  dateTime: Date,
  studentId: number,
  excludeFlightId?: number
): Promise<{ available: boolean; reason?: string }> {
  // Calculate slot start and end (2 hour window)
  const slotStart = new Date(dateTime);
  const slotEnd = new Date(dateTime);
  slotEnd.setHours(slotEnd.getHours() + 2);

  // Check for conflicting flights
  const conflictingFlight = await prisma.flightBooking.findFirst({
    where: {
      studentId,
      scheduledDate: {
        gte: slotStart,
        lt: slotEnd,
      },
      status: {
        in: ['CONFIRMED', 'WEATHER_HOLD'],
      },
      ...(excludeFlightId && { id: { not: excludeFlightId } }),
    },
  });

  if (conflictingFlight) {
    return {
      available: false,
      reason: `Student has a conflicting flight at ${conflictingFlight.scheduledDate.toISOString()}`,
    };
  }

  return { available: true };
}

/**
 * Get student availability preferences
 */
export async function getStudentAvailability(studentId: number): Promise<{
  weekdays?: string[];
  preferredTimes?: string[];
}> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { availability: true },
  });

  if (!student || !student.availability) {
    return {};
  }

  try {
    return JSON.parse(student.availability);
  } catch {
    return {};
  }
}

/**
 * Generate time slots for the next 7 days
 */
export async function generateTimeSlotsForNextWeek(
  instructorId: number,
  aircraftId: number,
  studentId?: number,
  excludeFlightId?: number
): Promise<TimeSlot[]> {
  const startDate = new Date();
  startDate.setHours(8, 0, 0, 0); // Start at 8 AM

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // 7 days from now
  endDate.setHours(18, 0, 0, 0); // End at 6 PM

  return getAvailableSlots(startDate, endDate, instructorId, aircraftId, studentId, excludeFlightId);
}

