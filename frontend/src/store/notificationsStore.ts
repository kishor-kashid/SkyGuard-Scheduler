import { create } from 'zustand';
import { Notification } from '../types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notifications.service';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (options?: { unreadOnly?: boolean; limit?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async (options) => {
    set({ loading: true, error: null });
    try {
      const data = await getNotifications(options);
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        loading: false,
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ unreadCount: count });
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: number) => {
    try {
      await markAsRead(id);
      const { notifications, unreadCount } = get();
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n
      );
      const newUnreadCount = Math.max(0, unreadCount - 1);
      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark notification as read' });
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsRead();
      const { notifications } = get();
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        readAt: n.readAt || new Date().toISOString(),
      }));
      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to mark all as read' });
      throw error;
    }
  },

  deleteNotification: async (id: number) => {
    try {
      await deleteNotification(id);
      const { notifications, unreadCount } = get();
      const deletedNotification = notifications.find((n) => n.id === id);
      const updatedNotifications = notifications.filter((n) => n.id !== id);
      const newUnreadCount =
        deletedNotification && !deletedNotification.readAt
          ? Math.max(0, unreadCount - 1)
          : unreadCount;
      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete notification' });
      throw error;
    }
  },

  refreshNotifications: async () => {
    const { fetchNotifications, fetchUnreadCount } = get();
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  },
}));

