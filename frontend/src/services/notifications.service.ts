import api from './api';
import { ApiResponse, Notification, NotificationsResponse } from '../types';

/**
 * Get all notifications for the current user
 */
export async function getNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) {
    params.append('unreadOnly', 'true');
  }
  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }

  const response = await api.get<ApiResponse<NotificationsResponse>>(
    `/notifications${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<{ unreadCount: number }>>(
    '/notifications/unread-count'
  );
  return response.data.data.unreadCount;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: number): Promise<Notification> {
  const response = await api.put<ApiResponse<Notification>>(
    `/notifications/${notificationId}/read`
  );
  return response.data.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ count: number }> {
  const response = await api.put<ApiResponse<{ count: number; message: string }>>(
    '/notifications/read-all'
  );
  return response.data.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  await api.delete<ApiResponse<{ message: string }>>(`/notifications/${notificationId}`);
}

