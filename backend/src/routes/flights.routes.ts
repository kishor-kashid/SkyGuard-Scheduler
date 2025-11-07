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

export default router;

