import { apiRequest } from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}

export const notificationService = {
  // Lấy tất cả thông báo
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiRequest<NotificationResponse>('/api/notification/notifies');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (id: number): Promise<boolean> => {
    try {
      console.log('Making API call to mark as read:', `/api/notification/${id}/read`);
      const response = await apiRequest(`/api/notification/${id}/read`, {
        method: 'PATCH'
      });
      console.log('API response:', response);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Xóa thông báo
  deleteNotification: async (id: number): Promise<boolean> => {
    try {
      await apiRequest(`/api/notification/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (): Promise<boolean> => {
    try {
      await apiRequest('/api/notification/mark-all-read', {
        method: 'PUT'
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
};