import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../types';

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { unreadOnly, limit } = req.query;

    const where: any = {
      userId: req.user.userId,
    };

    // Filter for unread only if requested
    if (unreadOnly === 'true') {
      where.readAt = null;
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            scheduledDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit ? parseInt(limit as string) : 50,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        readAt: null,
      },
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: {
        count: result.count,
        message: `Marked ${result.count} notification(s) as read`,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user.userId) {
      throw new AppError('Access denied', 403);
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      data: {
        message: 'Notification deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const count = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        readAt: null,
      },
    });

    res.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
}

