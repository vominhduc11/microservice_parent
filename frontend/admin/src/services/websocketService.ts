import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

class WebSocketService {
  private client: Client | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private dealerSubscription: any = null;
  private orderSubscription: any = null;

  private getAuthToken(): string | null {
    const auth = localStorage.getItem('distributex_auth');
    if (auth) {
      const authData = JSON.parse(auth);
      return authData.token || null;
    }
    return null;
  }

  private getNotificationSettings() {
    const settings = localStorage.getItem('notification_settings');
    if (settings) {
      return JSON.parse(settings);
    }
    return {
      orderNotifications: true,
      dealerRegistrations: true,
    };
  }

  connect() {
    const socket = new SockJS(`${env.wsUrl}/ws`);
    const token = this.getAuthToken();

    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? {
        'Authorization': `Bearer ${token}`
      } : {},
      debug: (str) => {
        logger.debug('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      logger.info('WebSocket connected successfully');
      this.subscribeToTopics();
    };

    this.client.onStompError = (frame) => {
      logger.error('STOMP broker error', {
        message: frame.headers['message'],
        details: frame.body
      });
    };

    this.client.onWebSocketError = (error) => {
      logger.error('WebSocket connection error', error);
    };

    this.client.onDisconnect = () => {
      logger.info('Disconnected from WebSocket');
    };

    this.client.activate();
  }

  private subscribeToTopics() {
    const settings = this.getNotificationSettings();
    const token = this.getAuthToken();
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Subscribe to dealer registrations if enabled
    if (settings.dealerRegistrations) {
      this.subscribeToDealerRegistrations(authHeaders);
    }

    // Subscribe to order notifications if enabled
    if (settings.orderNotifications) {
      this.subscribeToOrderNotifications(authHeaders);
    }
  }

  private subscribeToDealerRegistrations(authHeaders: any) {
    if (this.dealerSubscription) {
      logger.info('Already subscribed to dealer registrations');
      return;
    }

    this.dealerSubscription = this.client?.subscribe('/topic/dealer-registrations', (message) => {
      logger.debug('Received dealer registration notification', message.body);
      const notification = JSON.parse(message.body);
      this.notifyCallbacks(notification);
    }, authHeaders);

    if (this.dealerSubscription) {
      logger.info('Successfully subscribed to dealer registration topic');
    } else {
      logger.error('Failed to subscribe to dealer registration topic');
    }
  }

  private subscribeToOrderNotifications(authHeaders: any) {
    if (this.orderSubscription) {
      logger.info('Already subscribed to order notifications');
      return;
    }

    this.orderSubscription = this.client?.subscribe('/topic/order-notifications', (message) => {
      logger.debug('Received order notification', message.body);
      const notification = JSON.parse(message.body);
      this.notifyCallbacks(notification);
    }, authHeaders);

    if (this.orderSubscription) {
      logger.info('Successfully subscribed to order notifications topic');
    } else {
      logger.error('Failed to subscribe to order notifications topic');
    }
  }

  updateSubscriptions() {
    if (!this.client?.connected) {
      logger.warn('Cannot update subscriptions: WebSocket not connected');
      return;
    }

    const settings = this.getNotificationSettings();
    const token = this.getAuthToken();
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // Handle dealer registrations subscription
    if (settings.dealerRegistrations && !this.dealerSubscription) {
      this.subscribeToDealerRegistrations(authHeaders);
    } else if (!settings.dealerRegistrations && this.dealerSubscription) {
      this.dealerSubscription.unsubscribe();
      this.dealerSubscription = null;
      logger.info('Unsubscribed from dealer registration topic');
    }

    // Handle order notifications subscription
    if (settings.orderNotifications && !this.orderSubscription) {
      this.subscribeToOrderNotifications(authHeaders);
    } else if (!settings.orderNotifications && this.orderSubscription) {
      this.orderSubscription.unsubscribe();
      this.orderSubscription = null;
      logger.info('Unsubscribed from order notifications topic');
    }
  }

  disconnect() {
    if (this.dealerSubscription) {
      this.dealerSubscription.unsubscribe();
      this.dealerSubscription = null;
    }
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
      this.orderSubscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribeToNotifications(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback);
  }

  unsubscribeFromNotifications(callback: (notification: Notification) => void) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }

  private notifyCallbacks(notification: Notification) {
    this.notificationCallbacks.forEach(callback => callback(notification));
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const websocketService = new WebSocketService();