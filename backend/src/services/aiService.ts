import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { env } from '../config/env';
import { RescheduleContext, RescheduleOption } from '../types';
import { getWeatherMinimumsDescription } from '../utils/weatherMinimums';
import { getWeatherForecast } from './weatherService';

// Initialize OpenAI client - only if API key is available
let openaiClient: ReturnType<typeof createOpenAI> | null = null;

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
 * Generate AI-powered reschedule options
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
    console.error('AI service error:', error);
    throw new Error('Failed to generate reschedule options. Please try again.');
  }
}

/**
 * Build the prompt for AI rescheduling
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
 * Format available slots for AI prompt
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
 * Get weather forecast for a future date (helper for AI context)
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

