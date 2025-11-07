import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNotificationsStore } from '../../store/notificationsStore';
import * as notificationsService from '../../services/notifications.service';
import { Notification } from '../../types';

// Mock the notifications service
vi.mock('../../services/notifications.service', () => ({
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

describe('Notifications Store', () => {
  beforeEach(() => {
    // Clear store state before each test
    useNotificationsStore.setState({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      const mockNotifications: Notification[] = [
        {
          id: 1,
          userId: 1,
          type: 'WEATHER_ALERT',
          message: 'Weather alert for flight #1',
          sentAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'FLIGHT_CONFIRMED',
          message: 'Flight confirmed',
          sentAt: new Date().toISOString(),
          readAt: new Date().toISOString(),
        },
      ];

      vi.mocked(notificationsService.getNotifications).mockResolvedValue({
        notifications: mockNotifications,
        unreadCount: 1,
      });

      await useNotificationsStore.getState().fetchNotifications();

      const state = useNotificationsStore.getState();
      expect(state.notifications).toEqual(mockNotifications);
      expect(state.unreadCount).toBe(1);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch');
      vi.mocked(notificationsService.getNotifications).mockRejectedValue(error);

      await useNotificationsStore.getState().fetchNotifications();

      const state = useNotificationsStore.getState();
      expect(state.notifications).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeDefined();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read and update unread count', async () => {
      const notification: Notification = {
        id: 1,
        userId: 1,
        type: 'WEATHER_ALERT',
        message: 'Test notification',
        sentAt: new Date().toISOString(),
      };

      useNotificationsStore.setState({
        notifications: [notification],
        unreadCount: 1,
      });

      const updatedNotification = {
        ...notification,
        readAt: new Date().toISOString(),
      };

      vi.mocked(notificationsService.markAsRead).mockResolvedValue(
        updatedNotification
      );

      await useNotificationsStore.getState().markAsRead(1);

      const state = useNotificationsStore.getState();
      expect(state.notifications[0].readAt).toBeDefined();
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const notifications: Notification[] = [
        {
          id: 1,
          userId: 1,
          type: 'WEATHER_ALERT',
          message: 'Alert 1',
          sentAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'WEATHER_ALERT',
          message: 'Alert 2',
          sentAt: new Date().toISOString(),
        },
      ];

      useNotificationsStore.setState({
        notifications,
        unreadCount: 2,
      });

      vi.mocked(notificationsService.markAllAsRead).mockResolvedValue({
        count: 2,
      });

      await useNotificationsStore.getState().markAllAsRead();

      const state = useNotificationsStore.getState();
      expect(state.notifications.every((n) => n.readAt)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification and update unread count', async () => {
      const notifications: Notification[] = [
        {
          id: 1,
          userId: 1,
          type: 'WEATHER_ALERT',
          message: 'Alert 1',
          sentAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          type: 'WEATHER_ALERT',
          message: 'Alert 2',
          sentAt: new Date().toISOString(),
          readAt: new Date().toISOString(),
        },
      ];

      useNotificationsStore.setState({
        notifications,
        unreadCount: 1,
      });

      vi.mocked(notificationsService.deleteNotification).mockResolvedValue();

      await useNotificationsStore.getState().deleteNotification(1);

      const state = useNotificationsStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].id).toBe(2);
      expect(state.unreadCount).toBe(0); // Unread notification was deleted
    });
  });
});

