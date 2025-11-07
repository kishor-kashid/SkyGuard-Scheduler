import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '../../store/notificationsStore';
import { Notification } from '../../types';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Calendar, RefreshCw, Plane } from 'lucide-react';

// Format time helper - using native Date instead of date-fns
const formatTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotificationsStore();
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.readAt) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    if (notification.bookingId) {
      navigate(`/flights`);
    } else {
      navigate('/dashboard');
    }

    onClose();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'WEATHER_ALERT':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'RESCHEDULE_OPTIONS':
      case 'RESCHEDULE_CONFIRMED':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 'FLIGHT_CONFIRMED':
      case 'FLIGHT_CANCELLED':
        return <Plane className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };


  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={refreshNotifications}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose();
            }}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.readAt ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${
                          !notification.readAt ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      {!notification.readAt && (
                        <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-1.5"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTime(notification.sentAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {!notification.readAt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

