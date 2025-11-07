import axios from 'axios';
import { env } from '../config/env';
import { WeatherData, WeatherConditions, Location, DemoScenario } from '../types';
import { getDemoScenario } from '../utils/demoScenarios';

// Global demo mode state (in production, this would be in a database or cache)
let demoModeEnabled = env.DEMO_MODE;
let currentDemoScenarioId: string | null = null;

/**
 * Set demo mode on/off
 */
export function setDemoMode(enabled: boolean): void {
  demoModeEnabled = enabled;
}

/**
 * Set the current demo scenario
 */
export function setDemoScenario(scenarioId: string | null): void {
  currentDemoScenarioId = scenarioId;
}

/**
 * Get current demo mode status
 */
export function isDemoModeEnabled(): boolean {
  return demoModeEnabled;
}

/**
 * Fetch weather data from OpenWeatherMap API
 */
async function fetchFromOpenWeather(location: Location): Promise<WeatherConditions> {
  if (!env.OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather`;
    const response = await axios.get(url, {
      params: {
        lat: location.lat,
        lon: location.lon,
        appid: env.OPENWEATHER_API_KEY,
        units: 'imperial', // Get temperature in Fahrenheit
      },
    });

    const data = response.data;

    // Convert OpenWeatherMap data to our WeatherConditions format
    const conditions: WeatherConditions = {
      visibility: (data.visibility || 10000) / 1609.34, // Convert meters to miles
      ceiling: data.clouds?.all ? calculateCeiling(data.clouds.all) : undefined,
      windSpeed: (data.wind?.speed || 0) * 0.868976, // Convert m/s to knots
      windDirection: data.wind?.deg,
      temperature: data.main?.temp || 0,
      humidity: data.main?.humidity || 0,
      precipitation: (data.rain && Object.keys(data.rain).length > 0) || 
                     (data.snow && Object.keys(data.snow).length > 0),
      thunderstorms: data.weather?.some((w: any) => 
        w.main === 'Thunderstorm' || w.id >= 200 && w.id < 300
      ) || false,
      icing: data.main?.temp < 32 && data.weather?.some((w: any) => 
        w.main === 'Rain' || w.main === 'Drizzle'
      ) || false,
      cloudCover: data.clouds?.all || 0,
      description: data.weather?.[0]?.description || 'Unknown',
    };

    return conditions;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`OpenWeatherMap API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Calculate approximate cloud ceiling from cloud cover percentage
 * This is an approximation - real ceiling requires METAR data
 */
function calculateCeiling(cloudCover: number): number {
  // Approximation: higher cloud cover = lower ceiling
  if (cloudCover < 25) return 10000; // Scattered clouds, high ceiling
  if (cloudCover < 50) return 5000; // Broken clouds
  if (cloudCover < 75) return 2000; // Overcast, medium ceiling
  return 1000; // Overcast, low ceiling
}

/**
 * Get weather data for a location
 * Uses demo mode if enabled, otherwise fetches from OpenWeatherMap
 */
export async function getWeather(location: Location): Promise<WeatherData> {
  let conditions: WeatherConditions;

  if (demoModeEnabled && currentDemoScenarioId) {
    // Use demo scenario
    const scenario = getDemoScenario(currentDemoScenarioId);
    if (!scenario) {
      throw new Error(`Demo scenario not found: ${currentDemoScenarioId}`);
    }
    conditions = scenario.weatherConditions;
  } else if (demoModeEnabled) {
    // Demo mode enabled but no scenario selected - use clear skies
    const clearSkies = getDemoScenario('clear-skies');
    conditions = clearSkies?.weatherConditions || {
      visibility: 10,
      ceiling: 15000,
      windSpeed: 5,
      temperature: 72,
      humidity: 45,
      precipitation: false,
      thunderstorms: false,
      icing: false,
    };
  } else {
    // Fetch from real API
    conditions = await fetchFromOpenWeather(location);
  }

  return {
    location,
    conditions,
    timestamp: new Date(),
  };
}

/**
 * Get weather forecast for a location (future dates)
 * For now, this uses current weather as a placeholder
 * In production, you'd use OpenWeatherMap forecast API
 */
export async function getWeatherForecast(
  location: Location,
  date: Date
): Promise<WeatherData> {
  // For now, return current weather
  // In production, use OpenWeatherMap forecast API:
  // https://api.openweathermap.org/data/2.5/forecast
  const weather = await getWeather(location);
  
  // Modify timestamp to match requested date
  weather.timestamp = date;
  
  return weather;
}

/**
 * Get weather for multiple locations (e.g., departure, destination, flight corridor)
 */
export async function getWeatherForLocations(
  locations: Location[]
): Promise<WeatherData[]> {
  const promises = locations.map((location) => getWeather(location));
  return Promise.all(promises);
}

