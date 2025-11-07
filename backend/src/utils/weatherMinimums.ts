import { TrainingLevel, WeatherConditions } from '../types';

/**
 * Weather minimums for each training level
 * Based on FAA regulations and flight training standards
 */

export interface WeatherMinimums {
  visibility: number; // minimum visibility in miles
  ceiling?: number; // minimum cloud ceiling in feet (if applicable)
  maxWindSpeed: number; // maximum wind speed in knots
  allowPrecipitation: boolean;
  allowThunderstorms: boolean;
  allowIcing: boolean;
  allowIMC: boolean; // Instrument Meteorological Conditions
}

/**
 * Get weather minimums for a specific training level
 */
export function getWeatherMinimums(trainingLevel: TrainingLevel): WeatherMinimums {
  switch (trainingLevel) {
    case TrainingLevel.STUDENT_PILOT:
      return {
        visibility: 5, // miles
        ceiling: undefined, // Clear skies required
        maxWindSpeed: 10, // knots
        allowPrecipitation: false,
        allowThunderstorms: false,
        allowIcing: false,
        allowIMC: false, // Must be VFR (Visual Flight Rules)
      };

    case TrainingLevel.PRIVATE_PILOT:
      return {
        visibility: 3, // miles
        ceiling: 1000, // feet
        maxWindSpeed: 20, // knots (more lenient than student)
        allowPrecipitation: true, // Light precipitation OK
        allowThunderstorms: false,
        allowIcing: false,
        allowIMC: false, // VFR required
      };

    case TrainingLevel.INSTRUMENT_RATED:
      return {
        visibility: 0, // No minimum (can fly in IMC)
        ceiling: 0, // No minimum (can fly in IMC)
        maxWindSpeed: 30, // knots (higher tolerance)
        allowPrecipitation: true,
        allowThunderstorms: false, // Still no thunderstorms
        allowIcing: false, // Still no icing
        allowIMC: true, // Can fly in Instrument Meteorological Conditions
      };

    default:
      // Default to most restrictive (student pilot)
      return getWeatherMinimums(TrainingLevel.STUDENT_PILOT);
  }
}

/**
 * Check if weather conditions meet the minimums for a training level
 */
export function meetsWeatherMinimums(
  conditions: WeatherConditions,
  trainingLevel: TrainingLevel
): { meets: boolean; violations: string[] } {
  const minimums = getWeatherMinimums(trainingLevel);
  const violations: string[] = [];

  // Check visibility
  if (conditions.visibility < minimums.visibility) {
    violations.push(
      `Visibility ${conditions.visibility} mi is below minimum of ${minimums.visibility} mi`
    );
  }

  // Check ceiling (if applicable)
  if (minimums.ceiling !== undefined && conditions.ceiling !== undefined) {
    if (conditions.ceiling < minimums.ceiling) {
      violations.push(
        `Ceiling ${conditions.ceiling} ft is below minimum of ${minimums.ceiling} ft`
      );
    }
  } else if (minimums.ceiling === undefined && conditions.ceiling !== undefined) {
    // Student pilot requires clear skies (no ceiling/clouds)
    if (conditions.ceiling < 10000) {
      violations.push('Clear skies required (no significant cloud cover)');
    }
  }

  // Check wind speed
  if (conditions.windSpeed > minimums.maxWindSpeed) {
    violations.push(
      `Wind speed ${conditions.windSpeed} kt exceeds maximum of ${minimums.maxWindSpeed} kt`
    );
  }

  // Check precipitation
  if (conditions.precipitation && !minimums.allowPrecipitation) {
    violations.push('Precipitation not allowed for this training level');
  }

  // Check thunderstorms
  if (conditions.thunderstorms && !minimums.allowThunderstorms) {
    violations.push('Thunderstorms not allowed');
  }

  // Check icing
  if (conditions.icing && !minimums.allowIcing) {
    violations.push('Icing conditions not allowed');
  }

  // Check IMC conditions (low visibility/ceiling)
  if (!minimums.allowIMC) {
    const isIMC = conditions.visibility < 3 || (conditions.ceiling !== undefined && conditions.ceiling < 1000);
    if (isIMC) {
      violations.push('Instrument Meteorological Conditions (IMC) not allowed for VFR flight');
    }
  }

  return {
    meets: violations.length === 0,
    violations,
  };
}

/**
 * Get human-readable description of weather minimums for a training level
 */
export function getWeatherMinimumsDescription(trainingLevel: TrainingLevel): string {
  const minimums = getWeatherMinimums(trainingLevel);
  const parts: string[] = [];

  parts.push(`Visibility: ${minimums.visibility} mi minimum`);

  if (minimums.ceiling !== undefined) {
    parts.push(`Ceiling: ${minimums.ceiling} ft minimum`);
  } else {
    parts.push('Ceiling: Clear skies required');
  }

  parts.push(`Wind: ${minimums.maxWindSpeed} kt maximum`);

  if (!minimums.allowPrecipitation) {
    parts.push('No precipitation allowed');
  }

  if (!minimums.allowThunderstorms) {
    parts.push('No thunderstorms allowed');
  }

  if (!minimums.allowIcing) {
    parts.push('No icing conditions allowed');
  }

  if (minimums.allowIMC) {
    parts.push('IMC conditions acceptable');
  } else {
    parts.push('VFR conditions required');
  }

  return parts.join(', ');
}

