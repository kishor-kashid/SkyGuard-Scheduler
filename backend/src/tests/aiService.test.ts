/**
 * Test script for AI Service
 * Run with: tsx src/tests/aiService.test.ts
 * 
 * Note: This requires OPENAI_API_KEY to be set in .env
 */

import { generateRescheduleOptions } from '../services/aiService';
import { RescheduleContext, TrainingLevel } from '../types';

async function testAIService() {
  console.log('🧪 Testing AI Rescheduling Service...\n');

  // Mock context for testing
  const mockContext: RescheduleContext = {
    originalFlight: {
      id: 1,
      scheduledDate: new Date('2025-11-10T14:00:00Z'),
      departureLocation: JSON.stringify({
        name: 'KAUS',
        lat: 30.1944,
        lon: -97.6699,
      }),
      destinationLocation: JSON.stringify({
        name: 'KSAT',
        lat: 29.5337,
        lon: -97.4697,
      }),
      studentId: 1,
      instructorId: 1,
      aircraftId: 1,
    },
    student: {
      id: 1,
      name: 'Sarah Johnson',
      trainingLevel: TrainingLevel.STUDENT_PILOT,
      availability: JSON.stringify({
        weekdays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: ['09:00', '14:00'],
      }),
    },
    instructor: {
      id: 1,
      name: 'John Smith',
    },
    aircraft: {
      id: 1,
      tailNumber: 'N12345',
      model: 'Cessna 172',
    },
    weatherConflict: {
      reason: 'Low visibility and high winds',
      violations: [
        'Visibility 3 mi is below minimum of 5 mi',
        'Wind speed 15 kt exceeds maximum of 10 kt',
      ],
    },
    availableSlots: [
      {
        dateTime: new Date('2025-11-11T09:00:00Z').toISOString(),
        available: true,
      },
      {
        dateTime: new Date('2025-11-11T14:00:00Z').toISOString(),
        available: true,
      },
      {
        dateTime: new Date('2025-11-12T09:00:00Z').toISOString(),
        available: true,
      },
      {
        dateTime: new Date('2025-11-12T14:00:00Z').toISOString(),
        available: true,
      },
      {
        dateTime: new Date('2025-11-13T09:00:00Z').toISOString(),
        available: true,
      },
    ],
  };

  try {
    console.log('📝 Generating reschedule options...\n');
    const options = await generateRescheduleOptions(mockContext);

    console.log('✅ Successfully generated reschedule options:\n');
    options.forEach((option, index) => {
      console.log(`Option ${index + 1} (Priority ${option.priority}):`);
      console.log(`  Date/Time: ${new Date(option.dateTime).toLocaleString()}`);
      console.log(`  Reasoning: ${option.reasoning}`);
      console.log(`  Weather Forecast: ${option.weatherForecast}`);
      console.log(`  Confidence: ${(option.confidence * 100).toFixed(1)}%`);
      console.log('');
    });

    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

// Run test if executed directly
if (require.main === module) {
  testAIService()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { testAIService };

