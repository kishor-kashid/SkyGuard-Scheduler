import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '../config/env';
import prisma from '../config/database';
import { 
  WeatherBriefing, 
  RiskAssessment, 
  WeatherRecommendation, 
  HistoricalComparison,
  TrainingLevel,
  WeatherData,
  Location,
  GenerateBriefingRequest,
  AppError
} from '../types';
import { getWeather, getWeatherForecast } from './weatherService';
import { getWeatherMinimumsDescription } from '../utils/weatherMinimums';

/**
 * OpenAI client instance for weather briefing service
 * Lazy-initialized to avoid errors when API key is not configured
 */
let openaiClient: ReturnType<typeof createOpenAI> | null = null;

/**
 * Get or initialize the OpenAI client
 */
function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }
  if (!openaiClient) {
    openaiClient = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * In-memory cache for weather briefings
 * Key: `${location.name}-${dateTime}-${trainingLevel}`
 * Value: { briefing, expiresAt }
 */
const briefingCache = new Map<string, { briefing: WeatherBriefing; expiresAt: Date }>();

/**
 * Zod schema for AI-generated weather briefing
 */
export const weatherBriefingSchema = z.object({
  summary: z.string().describe('Brief 2-3 sentence summary of weather conditions and flight safety'),
  currentConditions: z.object({
    description: z.string().describe('Natural language description of current weather'),
    visibility: z.number().describe('Visibility in miles'),
    ceiling: z.number().nullable().optional().describe('Cloud ceiling in feet, if applicable (null for clear skies)'),
    windSpeed: z.number().describe('Wind speed in knots'),
    temperature: z.number().describe('Temperature in Fahrenheit'),
    precipitation: z.boolean().describe('Whether precipitation is present'),
    thunderstorms: z.boolean().describe('Whether thunderstorms are present'),
    icing: z.boolean().describe('Whether icing conditions are present'),
  }),
  forecast: z.object({
    description: z.string().describe('Expected weather conditions for the flight time'),
    expectedChanges: z.array(z.string()).describe('List of expected weather changes'),
    timeRange: z.string().describe('Time range for the forecast (e.g., "10:00 AM - 2:00 PM")'),
  }),
  riskAssessment: z.object({
    level: z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']).describe('Overall risk level'),
    factors: z.array(z.string()).describe('List of risk factors'),
    summary: z.string().describe('Summary of risk assessment'),
  }),
  recommendation: z.object({
    action: z.enum(['PROCEED', 'CAUTION', 'DELAY', 'CANCEL']).describe('Recommended action'),
    reasoning: z.string().describe('Detailed reasoning for the recommendation'),
    alternatives: z.array(z.string()).optional().describe('Alternative options if available'),
  }),
  historicalComparison: z.object({
    similarConditions: z.array(z.object({
      date: z.string().describe('Date of similar conditions'),
      conditions: z.string().describe('Weather conditions'),
      outcome: z.string().describe('What happened (e.g., "Flight completed successfully")'),
    })).optional().describe('Similar historical weather conditions'),
    trends: z.string().optional().describe('Weather trend analysis'),
    confidence: z.number().min(0).max(1).describe('Confidence in historical comparison'),
  }).optional(),
  confidence: z.number().min(0).max(1).describe('Overall confidence in the briefing'),
});

/**
 * Format weather data for AI prompt
 */
function formatWeatherData(weather: WeatherData): string {
  const { conditions, location } = weather;
  return `
Location: ${location.name} (${location.lat}, ${location.lon})
Conditions: ${conditions.description || 'Unknown'}
Visibility: ${conditions.visibility} miles
Ceiling: ${conditions.ceiling ? `${conditions.ceiling} feet` : 'Clear skies'}
Wind: ${conditions.windSpeed} knots${conditions.windDirection ? ` from ${conditions.windDirection}°` : ''}
Temperature: ${conditions.temperature}°F
Humidity: ${conditions.humidity}%
Precipitation: ${conditions.precipitation ? 'Yes' : 'No'}
Thunderstorms: ${conditions.thunderstorms ? 'Yes' : 'No'}
Icing: ${conditions.icing ? 'Yes' : 'No'}
Cloud Cover: ${conditions.cloudCover || 0}%
`.trim();
}

/**
 * Format training level context for AI prompt
 */
function formatTrainingLevelContext(trainingLevel: TrainingLevel): string {
  const minimums = getWeatherMinimumsDescription(trainingLevel);
  return `
Training Level: ${trainingLevel}
Weather Minimums: ${minimums}
`.trim();
}

/**
 * Format flight context for AI prompt
 */
function formatFlightContext(
  location: Location,
  dateTime: Date,
  flightRoute?: { departure: Location; destination?: Location }
): string {
  const parts: string[] = [];
  parts.push(`Flight Date/Time: ${dateTime.toLocaleString()}`);
  parts.push(`Departure: ${location.name} (${location.lat}, ${location.lon})`);
  
  if (flightRoute?.destination) {
    parts.push(`Destination: ${flightRoute.destination.name} (${flightRoute.destination.lat}, ${flightRoute.destination.lon})`);
  }
  
  return parts.join('\n');
}

/**
 * Build comprehensive prompt for weather briefing generation
 */
function buildBriefingPrompt(
  weatherData: WeatherData,
  forecastData: WeatherData,
  trainingLevel: TrainingLevel,
  location: Location,
  dateTime: Date,
  flightRoute?: { departure: Location; destination?: Location },
  historicalData?: Array<{ date: Date; conditions: any; isSafe: boolean }>
): string {
  const weatherFormatted = formatWeatherData(weatherData);
  const forecastFormatted = formatWeatherData(forecastData);
  const trainingContext = formatTrainingLevelContext(trainingLevel);
  const flightContext = formatFlightContext(location, dateTime, flightRoute);
  
  let historicalSection = '';
  if (historicalData && historicalData.length > 0) {
    historicalSection = `
HISTORICAL WEATHER DATA:
${historicalData.map((h, i) => 
  `${i + 1}. Date: ${h.date.toLocaleDateString()}, Conditions: ${JSON.stringify(h.conditions)}, Safe: ${h.isSafe}`
).join('\n')}
`;
  }

  return `You are an expert aviation weather briefer for a flight training school. Generate a comprehensive, natural-language weather briefing personalized for a ${trainingLevel} pilot.

CURRENT WEATHER CONDITIONS:
${weatherFormatted}

FORECAST FOR FLIGHT TIME:
${forecastFormatted}

${trainingContext}

${flightContext}

${historicalSection}

INSTRUCTIONS:
1. Generate a clear, concise summary (2-3 sentences) of current conditions and flight safety
2. Provide detailed current conditions in natural language
3. Include forecast with expected changes and time range
4. Assess risk level (LOW, MODERATE, HIGH, SEVERE) with specific factors
5. Provide a clear recommendation (PROCEED, CAUTION, DELAY, CANCEL) with detailed reasoning
6. If historical data is provided, compare current conditions to similar past conditions
7. Consider the pilot's training level and weather minimums throughout
8. Use aviation terminology appropriately but keep it accessible
9. Provide confidence score (0-1) for the briefing

Generate a comprehensive weather briefing that helps the pilot make an informed decision.`;
}

/**
 * Get historical weather data for a location
 * Queries past weather checks from the database
 */
export async function getHistoricalWeather(
  location: Location,
  dateTime: Date,
  limit: number = 5
): Promise<Array<{ date: Date; conditions: any; isSafe: boolean }>> {
  try {
    // Find flights with similar departure locations
    // We'll search for flights within ±7 days of the same date in previous years/months
    const targetDate = new Date(dateTime);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 7);

    // Get weather checks for flights at similar locations
    // Note: This is a simplified approach - in production, you'd want more sophisticated matching
    const weatherChecks = await prisma.weatherCheck.findMany({
      where: {
        checkTimestamp: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: {
        booking: {
          select: {
            departureLocation: true,
            scheduledDate: true,
          },
        },
      },
      orderBy: {
        checkTimestamp: 'desc',
      },
      take: limit * 3, // Get more to filter by location similarity
    });

    // Filter by location similarity (within ~10 miles)
    const similarChecks = weatherChecks
      .filter((check) => {
        try {
          const departure = JSON.parse(check.booking.departureLocation);
          const distance = calculateDistance(
            location.lat,
            location.lon,
            departure.lat,
            departure.lon
          );
          return distance < 10; // Within 10 miles
        } catch {
          return false;
        }
      })
      .slice(0, limit);

    return similarChecks.map((check) => ({
      date: check.checkTimestamp,
      conditions: JSON.parse(check.weatherData),
      isSafe: check.isSafe,
    }));
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find similar weather conditions from historical data
 */
export async function findSimilarConditions(
  location: Location,
  currentConditions: any,
  limit: number = 3
): Promise<Array<{ date: Date; conditions: any; isSafe: boolean }>> {
  const historical = await getHistoricalWeather(location, new Date(), limit * 2);
  
  // Simple similarity scoring based on key weather parameters
  const scored = historical.map((h) => {
    const score = calculateSimilarityScore(currentConditions, h.conditions);
    return { ...h, score };
  });

  // Sort by similarity score and return top matches
  return scored
    .sort((a, b) => (b as any).score - (a as any).score)
    .slice(0, limit)
    .map(({ score, ...rest }) => rest);
}

/**
 * Calculate similarity score between two weather conditions
 */
function calculateSimilarityScore(conditions1: any, conditions2: any): number {
  let score = 0;
  const factors = ['visibility', 'windSpeed', 'temperature', 'precipitation', 'thunderstorms', 'icing'];
  
  factors.forEach((factor) => {
    if (conditions1[factor] === conditions2[factor]) {
      score += 1;
    } else if (typeof conditions1[factor] === 'number' && typeof conditions2[factor] === 'number') {
      // For numeric values, calculate similarity based on difference
      const diff = Math.abs(conditions1[factor] - conditions2[factor]);
      const max = Math.max(conditions1[factor], conditions2[factor]);
      if (max > 0) {
        score += 1 - (diff / max);
      }
    }
  });

  return score / factors.length;
}

/**
 * Generate risk assessment using AI
 */
export async function generateRiskAssessment(
  weatherData: WeatherData,
  trainingLevel: TrainingLevel
): Promise<RiskAssessment> {
  const prompt = `Assess the flight risk for a ${trainingLevel} pilot given these weather conditions:

${formatWeatherData(weatherData)}

${formatTrainingLevelContext(trainingLevel)}

Provide a risk assessment with:
1. Risk level: LOW, MODERATE, HIGH, or SEVERE
2. List of specific risk factors
3. Summary of the risk assessment

Consider the pilot's training level and weather minimums.`;

  try {
    const openai = getOpenAIClient();
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        level: z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']),
        factors: z.array(z.string()),
        summary: z.string(),
      }),
      prompt,
      temperature: 0.3, // Lower temperature for more consistent risk assessment
    });

    return object;
  } catch (error) {
    console.error('Error generating risk assessment:', error);
    // Fallback risk assessment
    return {
      level: 'MODERATE',
      factors: ['Unable to generate AI assessment'],
      summary: 'Risk assessment unavailable',
    };
  }
}

/**
 * Generate weather recommendation using AI
 */
export async function generateRecommendation(
  weatherData: WeatherData,
  riskAssessment: RiskAssessment,
  trainingLevel: TrainingLevel
): Promise<WeatherRecommendation> {
  const prompt = `Based on the weather conditions and risk assessment, provide a flight recommendation for a ${trainingLevel} pilot:

${formatWeatherData(weatherData)}

Risk Assessment: ${riskAssessment.level} - ${riskAssessment.summary}
Risk Factors: ${riskAssessment.factors.join(', ')}

${formatTrainingLevelContext(trainingLevel)}

Provide a recommendation with:
1. Action: PROCEED, CAUTION, DELAY, or CANCEL
2. Detailed reasoning for the recommendation
3. Alternative options if available (e.g., "Wait 2 hours for conditions to improve")`;

  try {
    const openai = getOpenAIClient();
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        action: z.enum(['PROCEED', 'CAUTION', 'DELAY', 'CANCEL']),
        reasoning: z.string(),
        alternatives: z.array(z.string()).optional(),
      }),
      prompt,
      temperature: 0.5,
    });

    return object;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    // Fallback recommendation
    return {
      action: 'CAUTION',
      reasoning: 'Unable to generate AI recommendation',
    };
  }
}

/**
 * Compare current weather to historical patterns
 */
export async function compareHistoricalWeather(
  location: Location,
  currentConditions: any,
  dateTime: Date
): Promise<HistoricalComparison> {
  try {
    const similar = await findSimilarConditions(location, currentConditions, 3);
    
    if (similar.length === 0) {
      return {
        confidence: 0.3,
        trends: 'No historical data available for comparison',
      };
    }

    // Generate AI comparison
    const prompt = `Compare current weather conditions to these historical conditions:

CURRENT:
${JSON.stringify(currentConditions, null, 2)}

HISTORICAL:
${similar.map((s, i) => 
  `${i + 1}. ${s.date.toLocaleDateString()}: ${JSON.stringify(s.conditions)} (Safe: ${s.isSafe})`
).join('\n')}

Provide:
1. Similar conditions found with dates and outcomes
2. Weather trends analysis
3. Confidence in the comparison (0-1)`;

    const openai = getOpenAIClient();
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        similarConditions: z.array(z.object({
          date: z.string(),
          conditions: z.string(),
          outcome: z.string(),
        })).optional(),
        trends: z.string().optional(),
        confidence: z.number().min(0).max(1),
      }),
      prompt,
      temperature: 0.4,
    });

    return {
      similarConditions: object.similarConditions,
      trends: object.trends,
      confidence: object.confidence,
    };
  } catch (error) {
    console.error('Error comparing historical weather:', error);
    return {
      confidence: 0.3,
      trends: 'Historical comparison unavailable',
    };
  }
}

/**
 * Generate comprehensive weather briefing for a flight
 */
export async function generateWeatherBriefing(
  request: GenerateBriefingRequest
): Promise<WeatherBriefing> {
  // Check cache first
  const cacheKey = `${request.location.name}-${request.dateTime}-${request.trainingLevel}`;
  const cached = briefingCache.get(cacheKey);
  if (cached && cached.expiresAt > new Date()) {
    return cached.briefing;
  }

  const dateTime = new Date(request.dateTime);
  
  // Validate dateTime
  if (isNaN(dateTime.getTime())) {
    throw new Error('Invalid dateTime provided');
  }
  
  // Get current weather
  let currentWeather: WeatherData;
  try {
    currentWeather = await getWeather(request.location);
  } catch (error: any) {
    console.error('Error fetching current weather:', error);
    throw new Error(`Failed to fetch weather data: ${error.message || 'Unknown error'}`);
  }
  
  // Get forecast
  let forecastWeather: WeatherData;
  try {
    forecastWeather = await getWeatherForecast(request.location, dateTime);
  } catch (error: any) {
    console.error('Error fetching forecast:', error);
    // Use current weather as fallback
    forecastWeather = currentWeather;
    forecastWeather.timestamp = dateTime;
  }
  
  // Get historical weather data (non-blocking)
  let historicalData: Array<{ date: Date; conditions: any; isSafe: boolean }> = [];
  try {
    historicalData = await getHistoricalWeather(request.location, dateTime, 5);
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    // Continue without historical data
  }
  
  // Build prompt
  const prompt = buildBriefingPrompt(
    currentWeather,
    forecastWeather,
    request.trainingLevel,
    request.location,
    dateTime,
    request.flightRoute,
    historicalData
  );

  try {
    const openai = getOpenAIClient();
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: weatherBriefingSchema,
      prompt,
      temperature: 0.7,
    });

    // Generate historical comparison if we have data
    let historicalComparison: HistoricalComparison | undefined;
    if (historicalData.length > 0) {
      try {
        historicalComparison = await compareHistoricalWeather(
          request.location,
          currentWeather.conditions,
          dateTime
        );
      } catch (error) {
        console.error('Error generating historical comparison:', error);
        // Continue without historical comparison
      }
    }

    // Build briefing
    const briefing: WeatherBriefing = {
      summary: object.summary,
      currentConditions: {
        description: object.currentConditions.description,
        visibility: object.currentConditions.visibility,
        ceiling: object.currentConditions.ceiling,
        windSpeed: object.currentConditions.windSpeed,
        temperature: object.currentConditions.temperature,
        precipitation: object.currentConditions.precipitation,
        thunderstorms: object.currentConditions.thunderstorms,
        icing: object.currentConditions.icing,
      },
      forecast: {
        description: object.forecast.description,
        expectedChanges: object.forecast.expectedChanges,
        timeRange: object.forecast.timeRange,
      },
      riskAssessment: object.riskAssessment,
      recommendation: object.recommendation,
      historicalComparison: historicalComparison || object.historicalComparison,
      confidence: object.confidence,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
    };

    // Cache the briefing
    briefingCache.set(cacheKey, {
      briefing,
      expiresAt: briefing.expiresAt,
    });

    return briefing;
  } catch (error: any) {
    console.error('Error generating weather briefing:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.message?.includes('OPENAI_API_KEY')) {
      throw new AppError('OpenAI API key not configured. Please configure OPENAI_API_KEY in your environment variables.', 500);
    }
    
    if (error.message?.includes('OpenWeatherMap') || error.message?.includes('OPENWEATHER_API_KEY')) {
      throw new AppError('Weather data unavailable. Please check OpenWeatherMap API configuration.', 500);
    }
    
    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(`Failed to generate weather briefing: ${error.message || 'Unknown error'}`, 500);
  }
}

/**
 * Invalidate briefing cache for a location
 * Called when weather updates occur
 */
export function invalidateBriefingCache(location: Location): void {
  const keysToDelete: string[] = [];
  for (const key of briefingCache.keys()) {
    if (key.startsWith(`${location.name}-`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => briefingCache.delete(key));
}

/**
 * Get cached briefing if available and not expired
 */
export function getCachedBriefing(
  location: Location,
  dateTime: string,
  trainingLevel: TrainingLevel
): WeatherBriefing | null {
  const cacheKey = `${location.name}-${dateTime}-${trainingLevel}`;
  const cached = briefingCache.get(cacheKey);
  if (cached && cached.expiresAt > new Date()) {
    return cached.briefing;
  }
  return null;
}

