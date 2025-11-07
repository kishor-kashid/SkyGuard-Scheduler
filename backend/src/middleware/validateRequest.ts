import { Request, Response, NextFunction } from 'express';
import { AppError, CreateFlightRequest, RescheduleRequest } from '../types';

/**
 * Validate request body has required fields
 */
export function validateRequest(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        )
      );
    }

    next();
  };
}

/**
 * Validate flight creation request
 */
export function validateCreateFlightRequest(
  req: Request<{}, {}, CreateFlightRequest>,
  res: Response,
  next: NextFunction
) {
  const { studentId, instructorId, aircraftId, scheduledDate, departureLocation, flightType } =
    req.body;

  const errors: string[] = [];

  if (!studentId || typeof studentId !== 'number') {
    errors.push('studentId is required and must be a number');
  }

  if (!instructorId || typeof instructorId !== 'number') {
    errors.push('instructorId is required and must be a number');
  }

  if (!aircraftId || typeof aircraftId !== 'number') {
    errors.push('aircraftId is required and must be a number');
  }

  if (!scheduledDate) {
    errors.push('scheduledDate is required');
  } else {
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push('scheduledDate must be a valid ISO 8601 date string');
    }
  }

  if (!departureLocation) {
    errors.push('departureLocation is required');
  } else {
    if (!departureLocation.name || !departureLocation.lat || !departureLocation.lon) {
      errors.push('departureLocation must have name, lat, and lon');
    }
  }

  if (!flightType) {
    errors.push('flightType is required');
  }

  if (errors.length > 0) {
    return next(new AppError(`Validation errors: ${errors.join(', ')}`, 400));
  }

  next();
}

/**
 * Validate reschedule request
 */
export function validateRescheduleRequest(
  req: Request<{}, {}, RescheduleRequest>,
  res: Response,
  next: NextFunction
) {
  const { selectedOption } = req.body;

  if (!selectedOption) {
    return next(new AppError('selectedOption is required', 400));
  }

  if (!selectedOption.dateTime) {
    return next(new AppError('selectedOption.dateTime is required', 400));
  }

  const date = new Date(selectedOption.dateTime);
  if (isNaN(date.getTime())) {
    return next(new AppError('selectedOption.dateTime must be a valid ISO 8601 date string', 400));
  }

  next();
}

