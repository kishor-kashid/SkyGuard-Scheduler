import { Router } from 'express';
import {
  createFlight,
  getFlights,
  getFlightById,
  updateFlight,
  cancelFlight,
  generateRescheduleOptionsController,
  confirmReschedule,
  triggerWeatherCheck,
} from '../controllers/flights.controller';
import {
  getFlightHistoryController,
  getFlightNotesController,
  createFlightNoteController,
  logTrainingHoursController,
} from '../controllers/flightHistory.controller';
import {
  generateFlightBriefing,
  getFlightBriefing,
} from '../controllers/weatherBriefing.controller';
import { authenticateToken, requireAdmin, requireInstructorOrAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/flights
 * @desc    Create a new flight booking
 * @access  Private (admin or instructor)
 */
router.post('/', requireInstructorOrAdmin, createFlight);

/**
 * @route   GET /api/flights
 * @desc    Get all flights (with optional filters)
 * @access  Private (authenticated users - filtered by role)
 */
router.get('/', authenticateToken, getFlights);

/**
 * @route   POST /api/flights/:id/weather-briefing
 * @desc    Generate weather briefing for a flight
 * @access  Private (authenticated users - role-based access)
 */
router.post('/:id/weather-briefing', authenticateToken, generateFlightBriefing);

/**
 * @route   GET /api/flights/:id/weather-briefing
 * @desc    Get cached weather briefing for a flight
 * @access  Private (authenticated users - role-based access)
 */
router.get('/:id/weather-briefing', authenticateToken, getFlightBriefing);

/**
 * @route   GET /api/flights/:id/history
 * @desc    Get flight history for a specific flight
 * @access  Private (authenticated users)
 */
router.get('/:id/history', authenticateToken, getFlightHistoryController);

/**
 * @route   GET /api/flights/:id/notes
 * @desc    Get notes for a flight
 * @access  Private (authenticated users)
 */
router.get('/:id/notes', authenticateToken, getFlightNotesController);

/**
 * @route   GET /api/flights/:id
 * @desc    Get a single flight by ID
 * @access  Private (authenticated users - role-based access)
 */
router.get('/:id', authenticateToken, getFlightById);

/**
 * @route   PUT /api/flights/:id
 * @desc    Update a flight booking
 * @access  Private (admin or instructor)
 */
router.put('/:id', requireInstructorOrAdmin, updateFlight);

/**
 * @route   DELETE /api/flights/:id
 * @desc    Cancel a flight booking
 * @access  Private (admin or instructor)
 */
router.delete('/:id', requireInstructorOrAdmin, cancelFlight);

/**
 * @route   POST /api/flights/:id/check-weather
 * @desc    Manually trigger weather check for a flight
 * @access  Private (authenticated users)
 */
router.post('/:id/check-weather', authenticateToken, triggerWeatherCheck);

/**
 * @route   POST /api/flights/:id/reschedule-options
 * @desc    Generate AI-powered reschedule options
 * @access  Private (authenticated users)
 */
router.post('/:id/reschedule-options', authenticateToken, generateRescheduleOptionsController);

/**
 * @route   POST /api/flights/:id/confirm-reschedule
 * @desc    Confirm a reschedule selection
 * @access  Private (authenticated users)
 */
router.post('/:id/confirm-reschedule', authenticateToken, confirmReschedule);

/**
 * @route   POST /api/flights/:id/notes
 * @desc    Create a note for a flight
 * @access  Private (authenticated users)
 */
router.post('/:id/notes', authenticateToken, createFlightNoteController);

/**
 * @route   POST /api/flights/:id/training-hours
 * @desc    Log training hours for a flight
 * @access  Private (instructor or admin)
 */
router.post('/:id/training-hours', requireInstructorOrAdmin, logTrainingHoursController);

export default router;

