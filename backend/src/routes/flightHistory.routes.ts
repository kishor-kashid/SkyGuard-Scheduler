import { Router } from 'express';
import {
  getFlightHistoryController,
  getStudentFlightHistoryController,
  getInstructorFlightHistoryController,
  getFlightNotesController,
  createFlightNoteController,
  updateFlightNoteController,
  deleteFlightNoteController,
  logTrainingHoursController,
  getTrainingHoursController,
} from '../controllers/flightHistory.controller';
import { authenticateToken, requireInstructorOrAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/students/:id/flight-history
 * @desc    Get all flight history for a student
 * @access  Private (authenticated users)
 */
router.get('/students/:id/flight-history', authenticateToken, getStudentFlightHistoryController);

/**
 * @route   GET /api/instructors/:id/flight-history
 * @desc    Get all flight history for an instructor
 * @access  Private (authenticated users)
 */
router.get('/instructors/:id/flight-history', authenticateToken, getInstructorFlightHistoryController);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a flight note
 * @access  Private (authenticated users)
 */
router.put('/notes/:id', authenticateToken, updateFlightNoteController);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a flight note
 * @access  Private (authenticated users)
 */
router.delete('/notes/:id', authenticateToken, deleteFlightNoteController);

/**
 * @route   GET /api/students/:id/training-hours
 * @desc    Get training hours summary for a student
 * @access  Private (authenticated users)
 */
router.get('/students/:id/training-hours', authenticateToken, getTrainingHoursController);

export default router;

