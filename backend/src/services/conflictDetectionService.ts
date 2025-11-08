import prisma from '../config/database';
import { TrainingLevel, WeatherData, WeatherCheckResult } from '../types';
import { meetsWeatherMinimums } from '../utils/weatherMinimums';
import { getWeather, getWeatherForLocations } from './weatherService';

/**
 * Check if a flight is safe based on current weather conditions and student training level
 * 
 * This is the primary function for weather conflict detection. It:
 * 1. Retrieves the flight booking and student information from the database
 * 2. Fetches current weather data for departure and destination locations
 * 3. Evaluates weather against student's training level minimums
 * 4. Returns a comprehensive safety assessment
 * 
 * @param {number} flightId - The ID of the flight booking to check
 * @returns {Promise<WeatherCheckResult>} Safety assessment with isSafe flag, reason, weather data, and violations
 * @throws {Error} If flight booking or student is not found
 * 
 * @example
 * const safety = await checkFlightSafety(123);
 * if (!safety.isSafe) {
 *   console.log(`Unsafe: ${safety.reason}`);
 *   console.log(`Violations: ${safety.violations.join(', ')}`);
 * }
 */
export async function checkFlightSafety(
  flightId: number
): Promise<WeatherCheckResult> {
  // Get flight booking with student information
  const flight = await prisma.flightBooking.findUnique({
    where: { id: flightId },
    include: {
      student: true,
    },
  });

  if (!flight) {
    throw new Error(`Flight booking not found: ${flightId}`);
  }

  if (!flight.student) {
    throw new Error(`Student not found for flight: ${flightId}`);
  }

  // Parse departure location
  const departureLocation = JSON.parse(flight.departureLocation);
  
  // Get weather for departure location
  const locations: Array<{ name: string; lat: number; lon: number }> = [
    {
      name: departureLocation.name,
      lat: departureLocation.lat,
      lon: departureLocation.lon,
    },
  ];

  // Add destination location if provided
  if (flight.destinationLocation) {
    const destinationLocation = JSON.parse(flight.destinationLocation);
    locations.push({
      name: destinationLocation.name,
      lat: destinationLocation.lat,
      lon: destinationLocation.lon,
    });
  }

  // Get weather for all locations
  const weatherDataArray = await getWeatherForLocations(locations);

  // Use departure location weather for primary check
  const primaryWeather = weatherDataArray[0];

  // Evaluate weather against training level minimums
  const evaluation = evaluateWeatherAgainstMinimums(
    primaryWeather.conditions,
    flight.student.trainingLevel
  );

  // Check all locations for any violations
  const allViolations: string[] = [];
  for (const weatherData of weatherDataArray) {
    const evalResult = evaluateWeatherAgainstMinimums(
      weatherData.conditions,
      flight.student.trainingLevel
    );
    if (!evalResult.meets) {
      allViolations.push(
        `${weatherData.location.name}: ${evalResult.violations.join('; ')}`
      );
    }
  }

  return {
    isSafe: evaluation.meets && allViolations.length === 0,
    reason: allViolations.length > 0 
      ? `Weather violations at: ${allViolations.join('; ')}`
      : evaluation.meets 
        ? 'Weather conditions meet minimums'
        : `Weather violations: ${evaluation.violations.join('; ')}`,
    weatherData: primaryWeather,
    violations: allViolations.length > 0 ? allViolations : evaluation.violations,
  };
}

/**
 * Evaluate weather conditions against training level minimums
 * 
 * Delegates to the weatherMinimums utility to check if weather conditions
 * are safe for a pilot at the specified training level. Each training level
 * has different minimum requirements for visibility, ceiling, wind speed, etc.
 * 
 * Training Levels:
 * - STUDENT_PILOT: Requires clear skies, high visibility (>5 mi), low winds (<10 kt)
 * - PRIVATE_PILOT: Requires VFR minimums (visibility >3 mi, ceiling >1000 ft)
 * - INSTRUMENT_RATED: Can fly in IMC, but no thunderstorms or icing
 * 
 * @param {WeatherData['conditions']} conditions - Current weather conditions to evaluate
 * @param {TrainingLevel} trainingLevel - Student's training level (STUDENT_PILOT, PRIVATE_PILOT, or INSTRUMENT_RATED)
 * @returns {{meets: boolean, violations: string[]}} Evaluation result with flag and list of specific violations
 * 
 * @example
 * const result = evaluateWeatherAgainstMinimums(
 *   { visibility: 4, ceiling: 1500, windSpeed: 12, ... },
 *   'STUDENT_PILOT'
 * );
 * // Returns: { meets: false, violations: ['Wind speed too high (12 kt, max 10 kt)'] }
 */
export function evaluateWeatherAgainstMinimums(
  conditions: WeatherData['conditions'],
  trainingLevel: TrainingLevel
): { meets: boolean; violations: string[] } {
  return meetsWeatherMinimums(conditions, trainingLevel);
}

/**
 * Check weather for a specific location and training level
 * 
 * Simplified weather check for a single location without requiring a flight booking.
 * Useful for:
 * - Pre-flight planning
 * - Testing demo scenarios
 * - Checking weather at airports before scheduling
 * 
 * @param {Object} location - Location object with airport name and coordinates
 * @param {string} location.name - Airport code or name (e.g., "KJFK")
 * @param {number} location.lat - Latitude in decimal degrees
 * @param {number} location.lon - Longitude in decimal degrees
 * @param {TrainingLevel} trainingLevel - Training level to evaluate against
 * @returns {Promise<WeatherCheckResult>} Safety assessment with weather data and violations
 * 
 * @example
 * const result = await checkLocationWeather(
 *   { name: 'KJFK', lat: 40.6413, lon: -73.7781 },
 *   'STUDENT_PILOT'
 * );
 * if (!result.isSafe) {
 *   console.log(`Not safe for student pilots: ${result.reason}`);
 * }
 */
export async function checkLocationWeather(
  location: { name: string; lat: number; lon: number },
  trainingLevel: TrainingLevel
): Promise<WeatherCheckResult> {
  const weatherData = await getWeather(location);
  const evaluation = evaluateWeatherAgainstMinimums(
    weatherData.conditions,
    trainingLevel
  );

  return {
    isSafe: evaluation.meets,
    reason: evaluation.meets
      ? 'Weather conditions meet minimums'
      : `Weather violations: ${evaluation.violations.join('; ')}`,
    weatherData,
    violations: evaluation.violations,
  };
}

