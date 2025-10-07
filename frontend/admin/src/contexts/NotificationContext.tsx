import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { websocketService } from '@/services/websocketService';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  updateNotificationSettings: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forceUpdateCount, setForceUpdateCount] = useState(0);

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Lấy thông báo từ API khi đăng nhập
      fetchNotifications();

      // Connect to WebSocket only when authenticated
      websocketService.connect();

      // Subscribe to notifications
      const handleNewNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
      };

      websocketService.subscribeToNotifications(handleNewNotification);

      // Cleanup function
      return () => {
        websocketService.unsubscribeFromNotifications(handleNewNotification);
        websocketService.disconnect();
      };
    } else {
      // Disconnect when not authenticated
      websocketService.disconnect();
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (id: number) => {
    // Cập nhật state trước khi gọi API để UI responsive hơn
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      );
      return updated;
    });

    // Force re-render
    setForceUpdateCount(prev => prev + 1);

    // Sau đó gọi API
    try {
      const success = await notificationService.markAsRead(id);

      if (!success) {
        // Nếu API fail, revert lại state
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: false } : notif
          )
        );
      }
    } catch (error) {
      // Revert state nếu có lỗi
      setNotifications(prev => 
        prev.map(notif =>
          notif.id === id ? { ...notif, read: false } : notif
        )
      );
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  const deleteNotification = async (id: number) => {
    const success = await notificationService.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotificationSettings = () => {
    // Update WebSocket subscriptions based on new settings
    websocketService.updateSubscriptions();
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const value: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    updateNotificationSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};