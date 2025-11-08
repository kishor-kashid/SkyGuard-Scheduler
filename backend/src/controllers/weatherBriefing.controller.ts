import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import {
  generateWeatherBriefing,
  getCachedBriefing,
  invalidateBriefingCache,
} from '../services/weatherBriefingService';
import prisma from '../config/database';
import { TrainingLevel } from '../types';

/**
 * Generate weather briefing for a flight
 * POST /api/flights/:id/weather-briefing
 */
export async function generateFlightBriefing(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const flightId = parseInt(id);

    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    // Get flight with related data
    const flight = await prisma.flightBooking.findUnique({
      where: { id: flightId },
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

    // Check authorization
    const user = req.user;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (student && flight.studentId !== student.id) {
        throw new AppError('Unauthorized to access this flight', 403);
      }
    } else if (user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });
      if (instructor && flight.instructorId !== instructor.id) {
        throw new AppError('Unauthorized to access this flight', 403);
      }
    }

    // Parse departure location
    const departureLocation = JSON.parse(flight.departureLocation);
    const destinationLocation = flight.destinationLocation
      ? JSON.parse(flight.destinationLocation)
      : undefined;

    // Generate briefing
    const briefing = await generateWeatherBriefing({
      location: departureLocation,
      dateTime: flight.scheduledDate.toISOString(),
      trainingLevel: flight.student.trainingLevel,
      flightRoute: {
        departure: departureLocation,
        destination: destinationLocation,
      },
    });

    res.json({
      success: true,
      data: briefing,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get cached weather briefing for a flight
 * GET /api/flights/:id/weather-briefing
 */
export async function getFlightBriefing(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const flightId = parseInt(id);

    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    // Get flight
    const flight = await prisma.flightBooking.findUnique({
      where: { id: flightId },
      include: {
        student: true,
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    // Check authorization
    const user = req.user;
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (student && flight.studentId !== student.id) {
        throw new AppError('Unauthorized to access this flight', 403);
      }
    } else if (user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: user.userId },
      });
      if (instructor && flight.instructorId !== instructor.id) {
        throw new AppError('Unauthorized to access this flight', 403);
      }
    }

    // Parse departure location
    const departureLocation = JSON.parse(flight.departureLocation);

    // Check cache
    const cached = getCachedBriefing(
      departureLocation,
      flight.scheduledDate.toISOString(),
      flight.student.trainingLevel
    );

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // If not cached, generate new briefing
    const briefing = await generateWeatherBriefing({
      location: departureLocation,
      dateTime: flight.scheduledDate.toISOString(),
      trainingLevel: flight.student.trainingLevel,
    });

    res.json({
      success: true,
      data: briefing,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error in getFlightBriefing:', error);
    // If it's already an AppError, pass it through
    if (error instanceof AppError) {
      return next(error);
    }
    // Otherwise, wrap it in an AppError
    next(new AppError(error.message || 'Failed to get weather briefing', 500));
  }
}

/**
 * Generate weather briefing for custom location/time
 * POST /api/weather/briefing
 */
export async function generateCustomBriefing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { location, dateTime, trainingLevel, flightRoute } = req.body;

    // Validate required fields
    if (!location || !location.name || !location.lat || !location.lon) {
      throw new AppError('Location with name, lat, and lon is required', 400);
    }

    if (!dateTime) {
      throw new AppError('dateTime is required (ISO 8601 format)', 400);
    }

    if (!trainingLevel) {
      throw new AppError('trainingLevel is required', 400);
    }

    // Validate training level
    if (!Object.values(TrainingLevel).includes(trainingLevel)) {
      throw new AppError('Invalid training level', 400);
    }

    // Validate dateTime format
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid dateTime format. Use ISO 8601 format', 400);
    }

    // Check cache first
    const cached = getCachedBriefing(location, dateTime, trainingLevel);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Generate briefing
    const briefing = await generateWeatherBriefing({
      location,
      dateTime,
      trainingLevel,
      flightRoute,
    });

    res.json({
      success: true,
      data: briefing,
      cached: false,
    });
  } catch (error: any) {
    console.error('Error in generateCustomBriefing:', error);
    // If it's already an AppError, pass it through
    if (error instanceof AppError) {
      return next(error);
    }
    // Otherwise, wrap it in an AppError
    next(new AppError(error.message || 'Failed to generate weather briefing', 500));
  }
}

