import { Router } from 'express';
import { getAirports } from '../controllers/airports.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/airports
 * @desc    Get all airports
 * @access  Private (admin only)
 */
router.get('/', requireAdmin, getAirports);

export default router;

