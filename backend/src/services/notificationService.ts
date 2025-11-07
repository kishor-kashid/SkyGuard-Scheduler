import prisma from '../config/database';
import { NotificationType } from '../types';

/**
 * Create an in-app notification
 */
export async function createInAppNotification(
  userId: number,
  type: NotificationType,
  message: string,
  bookingId?: number
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      bookingId: bookingId || null,
      type,
      message,
    },
  });

  return notification;
}

/**
 * Create notification for flight confirmation
 */
export async function notifyFlightConfirmation(
  userId: number,
  flightId: number,
  flightDetails: {
    scheduledDate: Date;
    departureLocation: string;
    destinationLocation?: string;
  }
) {
  const departure = JSON.parse(flightDetails.departureLocation);
  const destination = flightDetails.destinationLocation
    ? JSON.parse(flightDetails.destinationLocation)
    : null;

  const message = `Your flight has been confirmed for ${new Date(
    flightDetails.scheduledDate
  ).toLocaleString()}. Departure: ${departure.name}${destination ? ` → ${destination.name}` : ''}.`;

  return createInAppNotification(userId, NotificationType.FLIGHT_CONFIRMED, message, flightId);
}

/**
 * Create notification for weather alert
 */
export async function notifyWeatherAlert(
  userId: number,
  flightId: number,
  weatherConflict: {
    reason: string;
    violations: string[];
  }
) {
  const message = `Weather Alert: Your flight has been cancelled due to weather conditions. ${weatherConflict.reason}`;

  return createInAppNotification(userId, NotificationType.WEATHER_ALERT, message, flightId);
}

/**
 * Create notification for reschedule options
 */
export async function notifyRescheduleOptions(
  userId: number,
  flightId: number,
  optionsCount: number
) {
  const message = `${optionsCount} reschedule options are available for your cancelled flight. Please review and select your preferred time.`;

  return createInAppNotification(
    userId,
    NotificationType.RESCHEDULE_OPTIONS,
    message,
    flightId
  );
}

/**
 * Create notification for reschedule confirmation
 */
export async function notifyRescheduleConfirmation(
  userId: number,
  originalFlightId: number,
  newFlightId: number,
  newScheduledDate: Date
) {
  const message = `Your flight has been rescheduled to ${new Date(newScheduledDate).toLocaleString()}. Your new flight confirmation is ready.`;

  return createInAppNotification(
    userId,
    NotificationType.RESCHEDULE_CONFIRMED,
    message,
    newFlightId
  );
}

/**
 * Create notification for flight cancellation
 */
export async function notifyFlightCancellation(
  userId: number,
  flightId: number,
  reason?: string
) {
  const message = reason
    ? `Your flight has been cancelled. Reason: ${reason}`
    : 'Your flight has been cancelled.';

  return createInAppNotification(userId, NotificationType.FLIGHT_CANCELLED, message, flightId);
}

/**
 * Notify multiple users (e.g., student and instructor)
 */
export async function notifyUsers(
  userIds: number[],
  type: NotificationType,
  message: string,
  bookingId?: number
) {
  const notifications = await Promise.all(
    userIds.map((userId) => createInAppNotification(userId, type, message, bookingId))
  );

  return notifications;
}

