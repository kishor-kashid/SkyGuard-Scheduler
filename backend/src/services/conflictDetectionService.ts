import prisma from '../config/database';
import { TrainingLevel, WeatherData, WeatherCheckResult } from '../types';
import { meetsWeatherMinimums } from '../utils/weatherMinimums';
import { getWeather, getWeatherForLocations } from './weatherService';

/**
 * Check if a flight is safe based on weather conditions and student training level
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
 */
export function evaluateWeatherAgainstMinimums(
  conditions: WeatherData['conditions'],
  trainingLevel: TrainingLevel
): { meets: boolean; violations: string[] } {
  return meetsWeatherMinimums(conditions, trainingLevel);
}

/**
 * Check weather for a specific location and training level
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

