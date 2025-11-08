import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError, CreateFlightRequest, UpdateFlightRequest, RescheduleRequest, FlightStatus, RescheduleContext } from '../types';
import { checkFlightSafety } from '../services/conflictDetectionService';
import { generateRescheduleOptions } from '../services/aiService';
import { generateTimeSlotsForNextWeek } from '../services/schedulingService';
import {
  notifyFlightConfirmation,
  notifyWeatherAlert,
  notifyRescheduleOptions,
  notifyRescheduleConfirmation,
  notifyFlightCancellation,
} from '../services/notificationService';
import { logFlightAction } from '../services/flightHistoryService';
import { FlightHistoryAction } from '@prisma/client';

/**
 * Create a new flight booking
 */
export async function createFlight(
  req: Request<{}, {}, CreateFlightRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      studentId,
      instructorId,
      aircraftId,
      scheduledDate,
      departureLocation,
      destinationLocation,
      flightType,
      notes,
    } = req.body;

    // Validate required fields
    if (!studentId || !instructorId || !aircraftId || !scheduledDate || !departureLocation) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate scheduled date is in the future
    const scheduledDateTime = new Date(scheduledDate);
    if (scheduledDateTime < new Date()) {
      throw new AppError('Scheduled date must be in the future', 400);
    }

    // Check for scheduling conflicts
    const slotStart = new Date(scheduledDateTime);
    const slotEnd = new Date(scheduledDateTime);
    slotEnd.setHours(slotEnd.getHours() + 2);

    // Check instructor availability
    const instructorConflict = await prisma.flightBooking.findFirst({
      where: {
        instructorId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
      },
    });

    if (instructorConflict) {
      throw new AppError('Instructor is not available at this time', 409);
    }

    // Check aircraft availability
    const aircraftConflict = await prisma.flightBooking.findFirst({
      where: {
        aircraftId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
      },
    });

    if (aircraftConflict) {
      throw new AppError('Aircraft is not available at this time', 409);
    }

    // Check student availability
    const studentConflict = await prisma.flightBooking.findFirst({
      where: {
        studentId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
      },
    });

    if (studentConflict) {
      throw new AppError('Student is not available at this time', 409);
    }

    // Get user ID for audit trail
    const userId = (req as any).user?.userId;

    // Create flight booking
    const flight = await prisma.flightBooking.create({
      data: {
        studentId,
        instructorId,
        aircraftId,
        scheduledDate: scheduledDateTime,
        departureLocation: JSON.stringify(departureLocation),
        destinationLocation: destinationLocation ? JSON.stringify(destinationLocation) : null,
        flightType,
        status: FlightStatus.CONFIRMED,
        notes,
        createdBy: userId || null,
        lastModifiedBy: userId || null,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
      },
    });

    // Log flight creation in history
    if (userId) {
      await logFlightAction(
        flight.id,
        FlightHistoryAction.CREATED,
        userId,
        {
          status: flight.status,
          scheduledDate: flight.scheduledDate.toISOString(),
          studentId: flight.studentId,
          instructorId: flight.instructorId,
          aircraftId: flight.aircraftId,
        },
        'Flight created'
      );
    }

    // Send confirmation notifications
    await notifyFlightConfirmation(flight.student.user.id, flight.id, {
      scheduledDate: flight.scheduledDate,
      departureLocation: flight.departureLocation,
      destinationLocation: flight.destinationLocation || undefined,
    });
    await notifyFlightConfirmation(flight.instructor.user.id, flight.id, {
      scheduledDate: flight.scheduledDate,
      departureLocation: flight.departureLocation,
      destinationLocation: flight.destinationLocation || undefined,
    });

    // TODO: Queue initial weather check (PR #8)

    res.status(201).json({
      success: true,
      data: flight,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all flights with optional filters
 */
export async function getFlights(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, instructorId, status, startDate, endDate } = req.query;
    const user = req.user;

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (user?.role === 'STUDENT') {
      // Students can only see their own flights
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (student) {
        where.studentId = student.id;
      } else {
        return res.json({ success: true, data: [] });
      }
    } else if (user?.role === 'INSTRUCTOR') {
      // Instructors can see their assigned flights
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });
      if (instructor) {
        where.instructorId = instructor.id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }
    // Admins can see all flights

    // Apply filters
    if (studentId) {
      where.studentId = parseInt(studentId as string);
    }
    if (instructorId) {
      where.instructorId = parseInt(instructorId as string);
    }
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) {
        where.scheduledDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.scheduledDate.lte = new Date(endDate as string);
      }
    }

    const flights = await prisma.flightBooking.findMany({
      where,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
        weatherChecks: {
          orderBy: {
            checkTimestamp: 'desc',
          },
          take: 1, // Latest weather check
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    res.json({
      success: true,
      data: flights,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single flight by ID
 */
export async function getFlightById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user;

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
        weatherChecks: {
          orderBy: {
            checkTimestamp: 'desc',
          },
        },
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Check authorization
    if (user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (student && flight.studentId !== student.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (user?.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });
      if (instructor && flight.instructorId !== instructor.id) {
        throw new AppError('Access denied', 403);
      }
    }

    res.json({
      success: true,
      data: flight,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a flight booking
 */
export async function updateFlight(
  req: Request<{ id: string }, {}, UpdateFlightRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Only allow updates to CONFIRMED or WEATHER_HOLD flights
    if (flight.status === 'CANCELLED' || flight.status === 'COMPLETED') {
      throw new AppError('Cannot update cancelled or completed flights', 400);
    }

    // Build update data
    if (req.body.scheduledDate) {
      const newDate = new Date(req.body.scheduledDate);
      if (newDate < new Date()) {
        throw new AppError('Scheduled date must be in the future', 400);
      }
      updateData.scheduledDate = newDate;
    }

    if (req.body.departureLocation) {
      updateData.departureLocation = JSON.stringify(req.body.departureLocation);
    }

    if (req.body.destinationLocation !== undefined) {
      updateData.destinationLocation = req.body.destinationLocation
        ? JSON.stringify(req.body.destinationLocation)
        : null;
    }

    if (req.body.flightType) {
      updateData.flightType = req.body.flightType;
    }

    if (req.body.status) {
      updateData.status = req.body.status;
    }

    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes;
    }

    // Get user ID for audit trail
    const userId = (req as any).user?.userId;
    if (userId) {
      updateData.lastModifiedBy = userId;
      updateData.version = { increment: 1 }; // Optimistic locking
    }

    // Track changes for history
    const changes: Record<string, any> = {};
    if (updateData.scheduledDate) {
      changes.scheduledDate = {
        old: flight.scheduledDate.toISOString(),
        new: updateData.scheduledDate.toISOString(),
      };
    }
    if (updateData.status) {
      changes.status = {
        old: flight.status,
        new: updateData.status,
      };
    }
    if (updateData.flightType) {
      changes.flightType = {
        old: flight.flightType,
        new: updateData.flightType,
      };
    }
    if (updateData.notes !== undefined) {
      changes.notes = {
        old: flight.notes,
        new: updateData.notes,
      };
    }

    const updatedFlight = await prisma.flightBooking.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
      },
    });

    // Log flight update in history
    if (userId && Object.keys(changes).length > 0) {
      const action = changes.status ? FlightHistoryAction.STATUS_CHANGED : FlightHistoryAction.UPDATED;
      await logFlightAction(
        updatedFlight.id,
        action,
        userId,
        changes,
        'Flight updated'
      );
    }

    res.json({
      success: true,
      data: updatedFlight,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a flight booking
 */
export async function cancelFlight(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    if (flight.status === 'CANCELLED') {
      throw new AppError('Flight is already cancelled', 400);
    }

    if (flight.status === 'COMPLETED') {
      throw new AppError('Cannot cancel completed flights', 400);
    }

    // Get user ID for audit trail
    const userId = (req as any).user?.userId;

    const cancelledFlight = await prisma.flightBooking.update({
      where: { id: parseInt(id) },
      data: {
        status: FlightStatus.CANCELLED,
        lastModifiedBy: userId || null,
        version: { increment: 1 },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
      },
    });

    // Log flight cancellation in history
    if (userId) {
      await logFlightAction(
        cancelledFlight.id,
        FlightHistoryAction.CANCELLED,
        userId,
        {
          oldStatus: flight.status,
          newStatus: FlightStatus.CANCELLED,
        },
        'Flight cancelled'
      );
    }

    // Send cancellation notifications
    await notifyFlightCancellation(
      cancelledFlight.student.user.id,
      cancelledFlight.id,
      'Flight cancelled by administrator'
    );
    await notifyFlightCancellation(
      cancelledFlight.instructor.user.id,
      cancelledFlight.id,
      'Flight cancelled by administrator'
    );

    res.json({
      success: true,
      data: cancelledFlight,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate AI-powered reschedule options for a flight
 */
export async function generateRescheduleOptionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Restrict reschedule options to students only
    if (user.role !== 'STUDENT') {
      throw new AppError('Only students can view reschedule options', 403);
    }

    // Verify the user is the student associated with this flight
    if (flight.student.userId !== user.userId) {
      throw new AppError('You can only view reschedule options for your own flights', 403);
    }

    if (flight.status === 'CANCELLED' || flight.status === 'COMPLETED') {
      throw new AppError('Cannot reschedule cancelled or completed flights', 400);
    }

    // Check if flight has weather hold status or recent unsafe weather check
    // If flight status is WEATHER_HOLD, allow rescheduling regardless of fresh check
    let weatherCheck;
    if (flight.status === 'WEATHER_HOLD') {
      // Flight is on weather hold, allow rescheduling
      // Get the latest weather check for context
      const latestWeatherCheck = await prisma.weatherCheck.findFirst({
        where: { bookingId: flight.id },
        orderBy: { checkTimestamp: 'desc' },
      });
      
      weatherCheck = {
        isSafe: false,
        reason: latestWeatherCheck?.reason || 'Flight is on weather hold',
        violations: latestWeatherCheck?.reason ? [latestWeatherCheck.reason] : ['Weather conditions do not meet minimums'],
      };
    } else {
      // For other statuses, check the latest weather check from database
      const latestWeatherCheck = await prisma.weatherCheck.findFirst({
        where: { bookingId: flight.id },
        orderBy: { checkTimestamp: 'desc' },
      });

      // If there's a recent unsafe weather check, use it
      // Otherwise, perform a fresh weather check
      if (latestWeatherCheck && !latestWeatherCheck.isSafe) {
        // Use existing unsafe weather check
        weatherCheck = {
          isSafe: false,
          reason: latestWeatherCheck.reason || 'Weather conflict detected',
          violations: latestWeatherCheck.reason ? [latestWeatherCheck.reason] : ['Weather conditions do not meet minimums'],
        };
      } else {
        // Perform fresh weather check
        weatherCheck = await checkFlightSafety(flight.id);
        
        if (weatherCheck.isSafe) {
          throw new AppError('Flight is safe - no weather conflict detected. Please check weather first if conditions have changed.', 400);
        }
      }
    }

    // Get available slots (including student availability check)
    const availableSlots = await generateTimeSlotsForNextWeek(
      flight.instructorId,
      flight.aircraftId,
      flight.studentId,
      flight.id
    );

    if (availableSlots.length === 0) {
      throw new AppError('No available time slots found for rescheduling', 404);
    }

    // Build reschedule context
    const context: RescheduleContext = {
      originalFlight: {
        id: flight.id,
        scheduledDate: flight.scheduledDate,
        departureLocation: flight.departureLocation,
        destinationLocation: flight.destinationLocation || undefined,
        studentId: flight.studentId,
        instructorId: flight.instructorId,
        aircraftId: flight.aircraftId,
      },
      student: {
        id: flight.student.id,
        name: flight.student.name,
        trainingLevel: flight.student.trainingLevel,
        availability: flight.student.availability || undefined,
      },
      instructor: {
        id: flight.instructor.id,
        name: flight.instructor.name,
      },
      aircraft: {
        id: flight.aircraft.id,
        tailNumber: flight.aircraft.tailNumber,
        model: flight.aircraft.model,
      },
      weatherConflict: {
        reason: weatherCheck.reason || 'Weather conflict detected',
        violations: weatherCheck.violations,
      },
      availableSlots,
    };

    // Generate AI reschedule options
    const options = await generateRescheduleOptions(context);

    // Notify student and instructor about reschedule options
    await notifyRescheduleOptions(flight.student.user.id, flight.id, options.length);
    await notifyRescheduleOptions(flight.instructor.user.id, flight.id, options.length);

    res.json({
      success: true,
      data: {
        flightId: flight.id,
        originalDate: flight.scheduledDate,
        options,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm a reschedule selection
 */
export async function confirmReschedule(
  req: Request<{ id: string }, {}, RescheduleRequest>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (!selectedOption || !selectedOption.dateTime) {
      throw new AppError('Selected option with dateTime is required', 400);
    }

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: true,
        aircraft: true,
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Restrict reschedule confirmation to students only
    if (user.role !== 'STUDENT') {
      throw new AppError('Only students can confirm reschedule options', 403);
    }

    // Verify the user is the student associated with this flight
    if (flight.student.userId !== user.userId) {
      throw new AppError('You can only confirm reschedule options for your own flights', 403);
    }

    if (flight.status === 'CANCELLED' || flight.status === 'COMPLETED') {
      throw new AppError('Cannot reschedule cancelled or completed flights', 400);
    }

    const newScheduledDate = new Date(selectedOption.dateTime);

    // Validate new date is in the future
    if (newScheduledDate < new Date()) {
      throw new AppError('New scheduled date must be in the future', 400);
    }

    // Check availability for new time
    const slotStart = new Date(newScheduledDate);
    const slotEnd = new Date(newScheduledDate);
    slotEnd.setHours(slotEnd.getHours() + 2);

    // Check instructor availability
    const instructorConflict = await prisma.flightBooking.findFirst({
      where: {
        instructorId: flight.instructorId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
        id: { not: flight.id },
      },
    });

    if (instructorConflict) {
      throw new AppError('Instructor is not available at the selected time', 409);
    }

    // Check aircraft availability
    const aircraftConflict = await prisma.flightBooking.findFirst({
      where: {
        aircraftId: flight.aircraftId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
        id: { not: flight.id },
      },
    });

    if (aircraftConflict) {
      throw new AppError('Aircraft is not available at the selected time', 409);
    }

    // Check student availability
    const studentConflict = await prisma.flightBooking.findFirst({
      where: {
        studentId: flight.studentId,
        scheduledDate: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          in: ['CONFIRMED', 'WEATHER_HOLD'],
        },
        id: { not: flight.id },
      },
    });

    if (studentConflict) {
      throw new AppError('Student is not available at the selected time', 409);
    }

    // Create reschedule event
    const rescheduleEvent = await prisma.rescheduleEvent.create({
      data: {
        originalBookingId: flight.id,
        suggestedOptions: JSON.stringify([selectedOption]),
        selectedOption: JSON.stringify(selectedOption),
        status: 'PENDING',
      },
    });

    // Update original flight to CANCELLED
    await prisma.flightBooking.update({
      where: { id: flight.id },
      data: {
        status: FlightStatus.CANCELLED,
        lastModifiedBy: user.userId,
        version: { increment: 1 },
      },
    });

    // Log reschedule in history for original flight
    await logFlightAction(
      flight.id,
      FlightHistoryAction.RESCHEDULED,
      user.userId,
      {
        oldScheduledDate: flight.scheduledDate.toISOString(),
        newScheduledDate: newScheduledDate.toISOString(),
        reason: 'Rescheduled by student',
      },
      'Flight rescheduled'
    );

    // Create new flight booking
    const newFlight = await prisma.flightBooking.create({
      data: {
        studentId: flight.studentId,
        instructorId: flight.instructorId,
        aircraftId: flight.aircraftId,
        scheduledDate: newScheduledDate,
        departureLocation: flight.departureLocation,
        destinationLocation: flight.destinationLocation,
        flightType: flight.flightType,
        status: FlightStatus.CONFIRMED,
        notes: flight.notes
          ? `${flight.notes}\n\nRescheduled from flight #${flight.id}`
          : `Rescheduled from flight #${flight.id}`,
        createdBy: user.userId,
        lastModifiedBy: user.userId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
        aircraft: true,
      },
    });

    // Update reschedule event with new booking ID
    await prisma.rescheduleEvent.update({
      where: { id: rescheduleEvent.id },
      data: {
        newBookingId: newFlight.id,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Log new flight creation in history
    await logFlightAction(
      newFlight.id,
      FlightHistoryAction.CREATED,
      user.userId,
      {
        status: newFlight.status,
        scheduledDate: newFlight.scheduledDate.toISOString(),
        studentId: newFlight.studentId,
        instructorId: newFlight.instructorId,
        aircraftId: newFlight.aircraftId,
        rescheduledFrom: flight.id,
      },
      'New flight created from reschedule'
    );

    // Send reschedule confirmation notifications
    await notifyRescheduleConfirmation(
      newFlight.student.user.id,
      flight.id,
      newFlight.id,
      newFlight.scheduledDate
    );
    await notifyRescheduleConfirmation(
      newFlight.instructor.user.id,
      flight.id,
      newFlight.id,
      newFlight.scheduledDate
    );

    res.json({
      success: true,
      data: {
        originalFlight: flight,
        newFlight,
        rescheduleEvent: {
          ...rescheduleEvent,
          newBookingId: newFlight.id,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Trigger manual weather check for a flight
 */
export async function triggerWeatherCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const flight = await prisma.flightBooking.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Perform weather check
    const weatherCheck = await checkFlightSafety(flight.id);

    // Save weather check to database
    const savedCheck = await prisma.weatherCheck.create({
      data: {
        bookingId: flight.id,
        weatherData: JSON.stringify(weatherCheck.weatherData),
        isSafe: weatherCheck.isSafe,
        reason: weatherCheck.reason || null,
      },
    });

    // Get user ID for audit trail
    const userId = (req as any).user?.userId;

    // Update flight status if unsafe
    if (!weatherCheck.isSafe && flight.status === 'CONFIRMED') {
      await prisma.flightBooking.update({
        where: { id: flight.id },
        data: {
          status: FlightStatus.WEATHER_HOLD,
          lastModifiedBy: userId || null,
          version: { increment: 1 },
        },
      });

      // Log status change in history
      if (userId) {
        await logFlightAction(
          flight.id,
          FlightHistoryAction.STATUS_CHANGED,
          userId,
          {
            oldStatus: FlightStatus.CONFIRMED,
            newStatus: FlightStatus.WEATHER_HOLD,
            reason: weatherCheck.reason || 'Weather conflict detected',
            violations: weatherCheck.violations,
          },
          'Weather conflict detected by manual check'
        );
      }

      // Send weather alert notifications
      await notifyWeatherAlert(flight.student.user.id, flight.id, {
        reason: weatherCheck.reason || 'Weather conflict detected',
        violations: weatherCheck.violations,
      });
      await notifyWeatherAlert(flight.instructor.user.id, flight.id, {
        reason: weatherCheck.reason || 'Weather conflict detected',
        violations: weatherCheck.violations,
      });
    }

    res.json({
      success: true,
      data: {
        weatherCheck: savedCheck,
        isSafe: weatherCheck.isSafe,
        reason: weatherCheck.reason,
        violations: weatherCheck.violations,
      },
    });
  } catch (error) {
    next(error);
  }
}

