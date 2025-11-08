import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import {
  getFlightHistory,
  getStudentFlightHistory,
  getInstructorFlightHistory,
} from '../services/flightHistoryService';
import {
  getFlightNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/flightNotesService';
import {
  logTrainingHours,
  getTrainingHoursSummary,
  getHoursByDateRange,
} from '../services/trainingHoursService';
import { AppError } from '../types';
import { NoteType, TrainingHoursCategory } from '@prisma/client';

/**
 * Get flight history for a specific flight
 * @route GET /api/flights/:id/history
 */
export async function getFlightHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const flightId = parseInt(req.params.id);
    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    const history = await getFlightHistory(flightId);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all flight history for a student
 * @route GET /api/students/:id/flight-history
 */
export async function getStudentFlightHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      throw new AppError('Invalid student ID', 400);
    }

    const history = await getStudentFlightHistory(studentId);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all flight history for an instructor
 * @route GET /api/instructors/:id/flight-history
 */
export async function getInstructorFlightHistoryController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const instructorId = parseInt(req.params.id);
    if (isNaN(instructorId)) {
      throw new AppError('Invalid instructor ID', 400);
    }

    const history = await getInstructorFlightHistory(instructorId);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
}

/**
 * Get notes for a flight
 * @route GET /api/flights/:id/notes
 */
export async function getFlightNotesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const flightId = parseInt(req.params.id);
    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    const notes = await getFlightNotes(flightId);
    res.json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a note for a flight
 * @route POST /api/flights/:id/notes
 */
export async function createFlightNoteController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const flightId = parseInt(req.params.id);
    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    const { noteType, content } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!noteType || !content) {
      throw new AppError('Note type and content are required', 400);
    }

    if (!Object.values(NoteType).includes(noteType)) {
      throw new AppError('Invalid note type', 400);
    }

    const note = await createNote(flightId, userId, noteType, content);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a flight note
 * @route PUT /api/notes/:id
 */
export async function updateFlightNoteController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId)) {
      throw new AppError('Invalid note ID', 400);
    }

    const { content } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!content) {
      throw new AppError('Content is required', 400);
    }

    const note = await updateNote(noteId, userId, content);
    res.json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a flight note
 * @route DELETE /api/notes/:id
 */
export async function deleteFlightNoteController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const noteId = parseInt(req.params.id);
    if (isNaN(noteId)) {
      throw new AppError('Invalid note ID', 400);
    }

    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await deleteNote(noteId, userId, userRole);
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Log training hours for a flight
 * @route POST /api/flights/:id/training-hours
 */
export async function logTrainingHoursController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const flightId = parseInt(req.params.id);
    if (isNaN(flightId)) {
      throw new AppError('Invalid flight ID', 400);
    }

    const { hours, category, date, instructorId, notes } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    if (!hours || !category || !date) {
      throw new AppError('Hours, category, and date are required', 400);
    }

    if (!Object.values(TrainingHoursCategory).includes(category)) {
      throw new AppError('Invalid training hours category', 400);
    }

    // Get student ID from flight
    const flight = await prisma.flightBooking.findUnique({
      where: { id: flightId },
      select: { studentId: true },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404);
    }

    const trainingHours = await logTrainingHours(
      flight.studentId,
      parseFloat(hours),
      category,
      new Date(date),
      instructorId || userId,
      flightId,
      notes
    );

    res.status(201).json({ success: true, data: trainingHours });
  } catch (error) {
    next(error);
  }
}

/**
 * Get training hours summary for a student
 * @route GET /api/students/:id/training-hours
 */
export async function getTrainingHoursController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = parseInt(req.params.id);
    if (isNaN(studentId)) {
      throw new AppError('Invalid student ID', 400);
    }

    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const hours = await getHoursByDateRange(
        studentId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json({ success: true, data: hours });
    } else {
      const summary = await getTrainingHoursSummary(studentId);
      res.json({ success: true, data: summary });
    }
  } catch (error) {
    next(error);
  }
}

