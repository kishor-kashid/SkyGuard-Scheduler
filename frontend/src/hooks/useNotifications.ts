import { useEffect } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';

/**
 * Hook to manage notifications
 * Automatically fetches notifications and unread count on mount
 */
export function useNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotificationsStore();

  useEffect(() => {
    // Fetch notifications and unread count on mount
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
}

