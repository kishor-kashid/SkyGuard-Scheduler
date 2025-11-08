import cron from 'node-cron';
import prisma from '../config/database';
import { checkFlightSafety } from '../services/conflictDetectionService';
import { notifyWeatherAlert } from '../services/notificationService';
import { FlightStatus } from '../types';
import { logInfo, logError, logWarn } from '../utils/logger';
import { logFlightAction } from '../services/flightHistoryService';
import { FlightHistoryAction } from '@prisma/client';
import { invalidateBriefingCache } from '../services/weatherBriefingService';

/**
 * Run weather check for all upcoming flights (next 48 hours)
 * This function is called by the cron job
 */
export async function runWeatherCheck(): Promise<void> {
  const startTime = Date.now();
  logInfo('Starting scheduled weather check for upcoming flights');

  try {
    // Calculate time range: now to 48 hours from now
    const now = new Date();
    const future48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Get all confirmed flights scheduled in the next 48 hours
    const upcomingFlights = await prisma.flightBooking.findMany({
      where: {
        scheduledDate: {
          gte: now,
          lte: future48Hours,
        },
        status: {
          in: [FlightStatus.CONFIRMED, FlightStatus.WEATHER_HOLD],
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });

    logInfo(`Found ${upcomingFlights.length} flights to check`, {
      count: upcomingFlights.length,
      timeRange: {
        from: now.toISOString(),
        to: future48Hours.toISOString(),
      },
    });

    let conflictsDetected = 0;
    let checksCompleted = 0;
    let errors = 0;

    // Process each flight
    for (const flight of upcomingFlights) {
      try {
        // Perform weather check
        const weatherCheck = await checkFlightSafety(flight.id);

        // Save weather check to database
        await prisma.weatherCheck.create({
          data: {
            bookingId: flight.id,
            weatherData: JSON.stringify(weatherCheck.weatherData),
            isSafe: weatherCheck.isSafe,
            reason: weatherCheck.reason || null,
          },
        });

        // Invalidate briefing cache for this location
        try {
          const departureLocation = JSON.parse(flight.departureLocation);
          invalidateBriefingCache(departureLocation);
        } catch (error) {
          // Log but don't fail the weather check
          logWarn('Failed to invalidate briefing cache', { error, flightId: flight.id });
        }

        // If weather is unsafe and flight is still confirmed, update status and notify
        if (!weatherCheck.isSafe && flight.status === FlightStatus.CONFIRMED) {
          // Get admin user ID for system actions (or use null for system)
          const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true },
          });

          // Update flight status to WEATHER_HOLD
          await prisma.flightBooking.update({
            where: { id: flight.id },
            data: {
              status: FlightStatus.WEATHER_HOLD,
              lastModifiedBy: adminUser?.id || null,
              version: { increment: 1 },
            },
          });

          // Log status change in history
          if (adminUser) {
            await logFlightAction(
              flight.id,
              FlightHistoryAction.STATUS_CHANGED,
              adminUser.id,
              {
                oldStatus: FlightStatus.CONFIRMED,
                newStatus: FlightStatus.WEATHER_HOLD,
                reason: weatherCheck.reason || 'Weather conflict detected',
                violations: weatherCheck.violations,
              },
              'Weather conflict detected by automated check'
            );
          }

          // Send weather alert notifications to student and instructor
          await notifyWeatherAlert(flight.student.user.id, flight.id, {
            reason: weatherCheck.reason || 'Weather conflict detected',
            violations: weatherCheck.violations,
          });

          await notifyWeatherAlert(flight.instructor.user.id, flight.id, {
            reason: weatherCheck.reason || 'Weather conflict detected',
            violations: weatherCheck.violations,
          });

          conflictsDetected++;
          logWarn(`Weather conflict detected for flight ${flight.id}`, {
            flightId: flight.id,
            student: flight.student.name,
            scheduledDate: flight.scheduledDate,
            reason: weatherCheck.reason,
          });
        } else if (weatherCheck.isSafe && flight.status === FlightStatus.WEATHER_HOLD) {
          // Get admin user ID for system actions
          const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { id: true },
          });

          // If weather is now safe and flight was on hold, update back to confirmed
          await prisma.flightBooking.update({
            where: { id: flight.id },
            data: {
              status: FlightStatus.CONFIRMED,
              lastModifiedBy: adminUser?.id || null,
              version: { increment: 1 },
            },
          });

          // Log status change in history
          if (adminUser) {
            await logFlightAction(
              flight.id,
              FlightHistoryAction.STATUS_CHANGED,
              adminUser.id,
              {
                oldStatus: FlightStatus.WEATHER_HOLD,
                newStatus: FlightStatus.CONFIRMED,
                reason: 'Weather conditions cleared',
              },
              'Weather cleared by automated check'
            );
          }

          logInfo(`Weather cleared for flight ${flight.id}, status updated to CONFIRMED`, {
            flightId: flight.id,
          });
        }

        checksCompleted++;
      } catch (error) {
        errors++;
        logError(`Error checking weather for flight ${flight.id}`, error);
        // Continue with next flight even if one fails
      }
    }

    const duration = Date.now() - startTime;
    logInfo('Scheduled weather check completed', {
      totalFlights: upcomingFlights.length,
      checksCompleted,
      conflictsDetected,
      errors,
      durationMs: duration,
    });
  } catch (error) {
    logError('Fatal error in scheduled weather check', error);
    throw error;
  }
}

/**
 * Start the hourly weather check cron job
 * Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
 */
export function startWeatherCheckCron(): cron.ScheduledTask {
  logInfo('Starting weather check cron job (runs hourly)');

  // Schedule to run every hour at minute 0
  const task = cron.schedule('0 * * * *', async () => {
    try {
      await runWeatherCheck();
    } catch (error) {
      logError('Error in weather check cron job', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Chicago', // Adjust timezone as needed
  });

  logInfo('Weather check cron job started successfully');
  return task;
}

/**
 * Stop the weather check cron job
 */
export function stopWeatherCheckCron(task: cron.ScheduledTask): void {
  task.stop();
  logInfo('Weather check cron job stopped');
}

