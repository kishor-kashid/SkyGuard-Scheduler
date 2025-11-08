import { Router } from 'express';
import { getAirports } from '../controllers/airports.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/airports
 * @desc    Get all airports
 * @access  Private (authenticated users)
 */
router.get('/', authenticateToken, getAirports);

export default router;

