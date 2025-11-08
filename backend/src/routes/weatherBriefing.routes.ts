import { Router } from 'express';
import { generateCustomBriefing } from '../controllers/weatherBriefing.controller';
import { authenticateToken } from '../middleware/auth';

// Router for custom briefings (mounted at /api/weather)
// Note: Flight-specific briefings are in flights.routes.ts
export const customBriefingRouter = Router();

/**
 * @route   POST /api/weather/briefing
 * @desc    Generate weather briefing for custom location/time
 * @access  Private (authenticated users)
 */
customBriefingRouter.post('/briefing', authenticateToken, generateCustomBriefing);

