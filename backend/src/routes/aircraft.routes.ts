import { Router } from 'express';
import {
  getAircraft,
  getAircraftById,
} from '../controllers/aircraft.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/aircraft
 * @desc    Get all aircraft
 * @access  Private (admin only)
 */
router.get('/', requireAdmin, getAircraft);

/**
 * @route   GET /api/aircraft/:id
 * @desc    Get a single aircraft by ID
 * @access  Private (admin only)
 */
router.get('/:id', requireAdmin, getAircraftById);

export default router;

