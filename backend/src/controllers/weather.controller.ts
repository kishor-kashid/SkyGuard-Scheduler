import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { getWeather, setDemoMode, setDemoScenario, isDemoModeEnabled } from '../services/weatherService';
import { checkFlightSafety, checkLocationWeather } from '../services/conflictDetectionService';
import { getAllDemoScenarios } from '../utils/demoScenarios';
import { TrainingLevel } from '../types';

/**
 * Check weather for a flight booking
 */
export async function checkWeather(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { flightId } = req.body;

    if (!flightId) {
      throw new AppError('flightId is required', 400);
    }

    const result = await checkFlightSafety(flightId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check weather for a specific location
 */
export async function checkLocationWeatherController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { location, trainingLevel } = req.body;

    if (!location || !location.lat || !location.lon) {
      throw new AppError('Location with lat and lon is required', 400);
    }

    if (!trainingLevel) {
      throw new AppError('Training level is required', 400);
    }

    // Validate training level
    if (!Object.values(TrainingLevel).includes(trainingLevel)) {
      throw new AppError('Invalid training level', 400);
    }

    const result = await checkLocationWeather(
      location,
      trainingLevel as TrainingLevel
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all available demo scenarios
 */
export async function getDemoScenarios(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const scenarios = getAllDemoScenarios();

    res.json({
      success: true,
      data: {
        scenarios,
        demoModeEnabled: isDemoModeEnabled(),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Set demo mode on/off
 */
export async function setDemoModeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      throw new AppError('enabled must be a boolean', 400);
    }

    setDemoMode(enabled);

    res.json({
      success: true,
      data: {
        demoModeEnabled: enabled,
        message: `Demo mode ${enabled ? 'enabled' : 'disabled'}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Set current demo scenario
 */
export async function setDemoScenarioController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { scenarioId } = req.body;

    if (scenarioId === null || scenarioId === undefined) {
      setDemoScenario(null);
      return res.json({
        success: true,
        data: {
          message: 'Demo scenario cleared',
          demoModeEnabled: isDemoModeEnabled(),
        },
      });
    }

    const scenarios = getAllDemoScenarios();
    const scenario = scenarios.find((s) => s.id === scenarioId);

    if (!scenario) {
      throw new AppError(`Demo scenario not found: ${scenarioId}`, 404);
    }

    setDemoScenario(scenarioId);

    res.json({
      success: true,
      data: {
        scenario,
        message: `Demo scenario set to: ${scenario.name}`,
        demoModeEnabled: isDemoModeEnabled(),
      },
    });
  } catch (error) {
    next(error);
  }
}

