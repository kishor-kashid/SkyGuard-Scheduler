import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../types';

/**
 * Get all aircraft
 * Available to instructors and admins (needed for flight creation)
 */
export async function getAircraft(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      throw new AppError('Access denied. Instructor or admin access required.', 403);
    }

    // Get all aircraft with flight count
    const aircraft = await prisma.aircraft.findMany({
      include: {
        _count: {
          select: {
            flights: true,
          },
        },
      },
      orderBy: {
        tailNumber: 'asc',
      },
    });

    // Format response
    const formattedAircraft = aircraft.map((ac) => ({
      id: ac.id,
      tailNumber: ac.tailNumber,
      model: ac.model,
      type: ac.type,
      flightCount: ac._count.flights,
      createdAt: ac.createdAt,
      updatedAt: ac.updatedAt,
    }));

    res.json({
      success: true,
      data: formattedAircraft,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single aircraft by ID
 * Admin only
 */
export async function getAircraftById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user?.role !== 'ADMIN') {
      throw new AppError('Access denied. Admin access required.', 403);
    }

    const aircraft = await prisma.aircraft.findUnique({
      where: { id: parseInt(id) },
      include: {
        flights: {
          take: 10,
          orderBy: {
            scheduledDate: 'desc',
          },
          include: {
            student: {
              select: {
                name: true,
              },
            },
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            flights: true,
          },
        },
      },
    });

    if (!aircraft) {
      throw new AppError('Aircraft not found', 404);
    }

    // Format response
    const formattedAircraft = {
      id: aircraft.id,
      tailNumber: aircraft.tailNumber,
      model: aircraft.model,
      type: aircraft.type,
      flightCount: aircraft._count.flights,
      recentFlights: aircraft.flights,
      createdAt: aircraft.createdAt,
      updatedAt: aircraft.updatedAt,
    };

    res.json({
      success: true,
      data: formattedAircraft,
    });
  } catch (error) {
    next(error);
  }
}

