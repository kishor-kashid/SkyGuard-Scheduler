import { DemoScenario, TrainingLevel, WeatherConditions } from '../types';

/**
 * Pre-built weather scenarios for demo/testing mode
 * These scenarios simulate different weather conditions to test conflict detection
 */

export const demoScenarios: DemoScenario[] = [
  {
    id: 'clear-skies',
    name: 'Clear Skies',
    description: 'Perfect weather conditions - suitable for all training levels',
    weatherConditions: {
      visibility: 10, // miles
      ceiling: 15000, // feet (high, clear)
      windSpeed: 5, // knots
      windDirection: 180,
      temperature: 72,
      humidity: 45,
      precipitation: false,
      thunderstorms: false,
      icing: false,
      cloudCover: 0,
      description: 'Clear skies, excellent visibility',
    },
    affectsTrainingLevels: [], // No conflicts
  },
  {
    id: 'student-conflict',
    name: 'Student Pilot Conflict',
    description: 'Weather conditions that violate Student Pilot minimums',
    weatherConditions: {
      visibility: 3, // miles (below 5 mi minimum)
      ceiling: 800, // feet (clouds present, not clear)
      windSpeed: 15, // knots (above 10 kt maximum)
      windDirection: 270,
      temperature: 65,
      humidity: 80,
      precipitation: true, // Light rain
      thunderstorms: false,
      icing: false,
      cloudCover: 60,
      description: 'Reduced visibility, clouds, light rain, moderate winds',
    },
    affectsTrainingLevels: [TrainingLevel.STUDENT_PILOT],
  },
  {
    id: 'private-conflict',
    name: 'Private Pilot Conflict',
    description: 'Weather conditions that violate Private Pilot minimums but OK for Instrument Rated',
    weatherConditions: {
      visibility: 2, // miles (below 3 mi minimum)
      ceiling: 500, // feet (below 1000 ft minimum)
      windSpeed: 12, // knots (OK)
      windDirection: 200,
      temperature: 60,
      humidity: 85,
      precipitation: true, // Moderate rain
      thunderstorms: false,
      icing: false,
      cloudCover: 80,
      description: 'Low visibility, low ceiling, precipitation - IMC conditions',
    },
    affectsTrainingLevels: [TrainingLevel.STUDENT_PILOT, TrainingLevel.PRIVATE_PILOT],
  },
  {
    id: 'instrument-conflict',
    name: 'Instrument Rated Conflict',
    description: 'Severe weather conditions that violate even Instrument Rated minimums',
    weatherConditions: {
      visibility: 1, // miles (very low)
      ceiling: 200, // feet (very low)
      windSpeed: 25, // knots (above 30 kt, but close)
      windDirection: 180,
      temperature: 45,
      humidity: 95,
      precipitation: true,
      thunderstorms: true, // Thunderstorms not allowed for anyone
      icing: true, // Icing not allowed for anyone
      cloudCover: 100,
      description: 'Severe weather with thunderstorms and icing',
    },
    affectsTrainingLevels: [
      TrainingLevel.STUDENT_PILOT,
      TrainingLevel.PRIVATE_PILOT,
      TrainingLevel.INSTRUMENT_RATED,
    ],
  },
  {
    id: 'marginal',
    name: 'Marginal Conditions',
    description: 'Borderline weather - may or may not be safe depending on exact conditions',
    weatherConditions: {
      visibility: 3.5, // miles (just above Private Pilot minimum)
      ceiling: 1100, // feet (just above Private Pilot minimum)
      windSpeed: 19, // knots (just below Private Pilot maximum)
      windDirection: 220,
      temperature: 68,
      humidity: 70,
      precipitation: false,
      thunderstorms: false,
      icing: false,
      cloudCover: 30,
      description: 'Marginal VFR conditions - borderline acceptable',
    },
    affectsTrainingLevels: [TrainingLevel.STUDENT_PILOT], // Only affects Student Pilots
  },
];

/**
 * Get a demo scenario by ID
 */
export function getDemoScenario(id: string): DemoScenario | undefined {
  return demoScenarios.find((scenario) => scenario.id === id);
}

/**
 * Get all demo scenarios
 */
export function getAllDemoScenarios(): DemoScenario[] {
  return demoScenarios;
}

