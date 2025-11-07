import { Router } from 'express';
import {
  checkWeather,
  checkLocationWeatherController,
  getDemoScenarios,
  setDemoModeController,
  setDemoScenarioController,
} from '../controllers/weather.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/weather/check
 * @desc    Check weather for a flight booking
 * @access  Private (authenticated users)
 */
router.post('/check', authenticateToken, checkWeather);

/**
 * @route   POST /api/weather/check-location
 * @desc    Check weather for a specific location and training level
 * @access  Private (authenticated users)
 */
router.post('/check-location', authenticateToken, checkLocationWeatherController);

/**
 * @route   GET /api/weather/scenarios
 * @desc    Get all available demo scenarios
 * @access  Private (authenticated users)
 */
router.get('/scenarios', authenticateToken, getDemoScenarios);

/**
 * @route   POST /api/weather/demo-mode
 * @desc    Enable/disable demo mode
 * @access  Private (admin only)
 */
router.post('/demo-mode', requireAdmin, setDemoModeController);

/**
 * @route   POST /api/weather/demo-scenario
 * @desc    Set current demo scenario
 * @access  Private (admin only)
 */
router.post('/demo-scenario', requireAdmin, setDemoScenarioController);

export default router;

