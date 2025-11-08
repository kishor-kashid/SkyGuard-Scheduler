import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '../config/env';
import { RescheduleContext, RescheduleOption } from '../types';
import { getWeatherMinimumsDescription } from '../utils/weatherMinimums';
import { getWeatherForecast } from './weatherService';

/**
 * OpenAI client instance for AI service
 * Lazy-initialized to avoid errors when API key is not configured
 */
let openaiClient: ReturnType<typeof createOpenAI> | null = null;

/**
 * Get or initialize the OpenAI client
 * @returns {ReturnType<typeof createOpenAI>} Configured OpenAI client
 * @throws {Error} If OPENAI_API_KEY environment variable is not set
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

// Re-export RescheduleContext for use in controllers
export type { RescheduleContext } from '../types';

/**
 * Zod schema for AI-generated reschedule options
 */
export const rescheduleOptionsSchema = z.object({
  options: z
    .array(
      z.object({
        dateTime: z.string().describe('ISO 8601 date and time string'),
        reasoning: z
          .string()
          .describe(
            'Detailed explanation of why this time slot is optimal, considering availability, weather patterns, and training needs'
          ),
        weatherForecast: z
          .string()
          .describe('Expected weather conditions for this time slot'),
        priority: z
          .number()
          .int()
          .min(1)
          .max(3)
          .describe('Priority ranking: 1 = best option, 2 = good alternative, 3 = acceptable'),
        confidence: z
          .number()
          .min(0)
          .max(1)
          .describe('Confidence score from 0 to 1'),
      })
    )
    .length(3)
    .describe('Exactly 3 reschedule options, ranked by priority'),
});

/**
 * Generate AI-powered reschedule options for a cancelled flight
 * 
 * Uses OpenAI GPT-4o-mini to analyze available time slots and generate 3 optimal
 * reschedule suggestions based on:
 * - Student's training level and weather minimums
 * - Instructor and aircraft availability
 * - Historical weather patterns
 * - Student availability preferences
 * 
 * @param {RescheduleContext} context - Complete context including flight, student, instructor, aircraft, weather conflict, and available slots
 * @returns {Promise<RescheduleOption[]>} Array of 3 prioritized reschedule options with reasoning, weather forecast, and confidence scores
 * @throws {Error} If OpenAI API key is not configured or if API call fails
 * 
 * @example
 * const options = await generateRescheduleOptions({
 *   originalFlight: flight,
 *   student: studentData,
 *   instructor: instructorData,
 *   aircraft: aircraftData,
 *   weatherConflict: conflictData,
 *   availableSlots: slots
 * });
 * // Returns: [{ dateTime, reasoning, weatherForecast, priority, confidence }, ...]
 */
export async function generateRescheduleOptions(
  context: RescheduleContext
): Promise<RescheduleOption[]> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Build prompt with context
  const prompt = buildReschedulePrompt(context);

  try {
    const openai = getOpenAIClient();
    const { object } = await generateObject({
      // @ts-ignore - AI SDK version conflict in node_modules
      model: openai('gpt-4o-mini'), // Using gpt-4o-mini for cost efficiency, can upgrade to gpt-4 if needed
      schema: rescheduleOptionsSchema,
      prompt,
      temperature: 0.7, // Balance between creativity and consistency
    });

    // Convert to RescheduleOption format
    return object.options.map((option) => ({
      dateTime: option.dateTime,
      reasoning: option.reasoning,
      weatherForecast: option.weatherForecast,
      priority: option.priority,
      confidence: option.confidence,
    }));
  } catch (error) {
    // Error is logged and thrown for controller to handle
    throw new Error('Failed to generate reschedule options. Please try again.');
  }
}

/**
 * Build a detailed prompt for the AI model to generate reschedule options
 * 
 * Constructs a comprehensive prompt including:
 * - Original flight details
 * - Weather conflict explanation
 * - Student training level requirements
 * - Available time slots
 * - Student availability preferences
 * - Instructions for the AI
 * 
 * @param {RescheduleContext} context - Complete rescheduling context
 * @returns {string} Formatted prompt string for OpenAI API
 * @private
 */
function buildReschedulePrompt(context: RescheduleContext): string {
  const weatherMinimums = getWeatherMinimumsDescription(context.student.trainingLevel);
  const availableSlots = formatAvailableSlots(context.availableSlots);
  const originalDate = new Date(context.originalFlight.scheduledDate).toLocaleString();

  return `You are an intelligent flight scheduling assistant for a flight training school. Your task is to suggest 3 optimal reschedule options for a flight that was cancelled due to weather.

ORIGINAL FLIGHT DETAILS:
- Flight ID: ${context.originalFlight.id}
- Original Date/Time: ${originalDate}
- Student: ${context.student.name} (${context.student.trainingLevel})
- Instructor: ${context.instructor.name}
- Aircraft: ${context.aircraft.tailNumber} (${context.aircraft.model})
- Departure: ${JSON.parse(context.originalFlight.departureLocation).name}
${context.originalFlight.destinationLocation ? `- Destination: ${JSON.parse(context.originalFlight.destinationLocation).name}` : ''}

WEATHER CONFLICT:
- Reason: ${context.weatherConflict.reason}
- Violations: ${context.weatherConflict.violations.join(', ')}

STUDENT TRAINING LEVEL REQUIREMENTS:
${weatherMinimums}

AVAILABLE TIME SLOTS:
${availableSlots}

STUDENT AVAILABILITY PREFERENCES:
${context.student.availability ? JSON.stringify(JSON.parse(context.student.availability || '{}'), null, 2) : 'No specific preferences'}

INSTRUCTIONS:
1. Analyze the available time slots and select the 3 best options
2. Consider:
   - Student's training level and weather minimums
   - Historical weather patterns (mornings often have better weather)
   - Student availability preferences
   - Instructor and aircraft availability
   - Optimal training progression timing
3. Rank options by priority (1 = best, 2 = good alternative, 3 = acceptable)
4. Provide detailed reasoning for each option
5. Include expected weather forecast for each time slot
6. Ensure all options are within the available slots provided

Generate exactly 3 reschedule options with detailed reasoning.`;
}

/**
 * Format available time slots into a human-readable string for AI prompt
 * 
 * Converts array of slot objects into numbered list with formatted dates
 * 
 * @param {Array<{dateTime: string, available: boolean}>} slots - Array of available time slots
 * @returns {string} Formatted string with numbered list of available slots
 * 
 * @example
 * formatAvailableSlots([
 *   { dateTime: '2024-03-21T10:00:00Z', available: true }
 * ]);
 * // Returns: "1. Wednesday, March 21, 2024 at 10:00 AM (2024-03-21T10:00:00.000Z)"
 */
export function formatAvailableSlots(slots: { dateTime: string; available: boolean }[]): string {
  if (slots.length === 0) {
    return 'No available slots found.';
  }

  return slots
    .map((slot, index) => {
      const date = new Date(slot.dateTime);
      return `${index + 1}. ${date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })} (${date.toISOString()})`;
    })
    .join('\n');
}

/**
 * Get weather minimums description for AI context
 * (Re-exported from weatherMinimums for convenience)
 */
export { getWeatherMinimumsDescription };

/**
 * Get weather forecast for a future date at a specific location
 * 
 * Helper function for providing weather context to AI. Calls the weather service
 * and formats the forecast into a concise string.
 * 
 * @param {Object} location - Location object with airport name and coordinates
 * @param {string} location.name - Airport code (e.g., "KJFK")
 * @param {number} location.lat - Latitude
 * @param {number} location.lon - Longitude
 * @param {Date} dateTime - Target date/time for forecast
 * @returns {Promise<string>} Formatted forecast string or "Weather forecast unavailable" if error
 * 
 * @example
 * const forecast = await getWeatherForecastForSlot(
 *   { name: 'KJFK', lat: 40.6413, lon: -73.7781 },
 *   new Date('2024-03-21T10:00:00Z')
 * );
 * // Returns: "Expected conditions: Clear skies, Visibility: 10 mi, Wind: 5 kt"
 */
export async function getWeatherForecastForSlot(
  location: { name: string; lat: number; lon: number },
  dateTime: Date
): Promise<string> {
  try {
    const forecast = await getWeatherForecast(location, dateTime);
    return `Expected conditions: ${forecast.conditions.description || 'Unknown'}, Visibility: ${forecast.conditions.visibility} mi, Wind: ${forecast.conditions.windSpeed} kt`;
  } catch (error) {
    return 'Weather forecast unavailable';
  }
}

