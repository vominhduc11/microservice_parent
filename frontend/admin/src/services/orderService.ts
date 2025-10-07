import { logger } from '../utils/logger';
import { refreshAccessToken, getIsRefreshing, getRefreshPromise, setRefreshState } from './api';

// Empty base URL for nginx proxy to work (endpoints already have /api prefix)
const API_BASE_URL = '';

// API Response interfaces
export interface ApiOrderItem {
  id: number;
  idProduct: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  status?: 'PENDING' | 'COMPLETED' | 'PARTIAL'; // Trạng thái phân bổ serials
}

export interface ApiOrderResponse {
  id: number;
  orderCode: string;
  idDealer: number;
  createdAt: string | null; // Đổi từ createAt thành createdAt
  paymentStatus: 'PAID' | 'UNPAID';
  orderItems: ApiOrderItem[];
  totalPrice: number;
}

export interface OrderListApiResponse {
  success: boolean;
  message: string;
  data: ApiOrderResponse[];
}

export interface DealerInfo {
  companyName: string;
  phone: string;
  email: string;
}

export interface DealerApiResponse {
  success: boolean;
  message: string;
  data: DealerInfo;
}

export interface UpdatePaymentStatusResponse {
  success: boolean;
  message: string; // "Payment status toggled successfully"
  data: {
    id: number;
    paymentStatus: 'PAID' | 'UNPAID';
    [key: string]: any; // Other fields from the order
  };
}

class OrderService {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}, _isRetry: boolean = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (token) {
      (defaultHeaders as any)['Authorization'] = `Bearer ${token}`;
    } else {
      logger.warn('No auth token found for order service request');
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          // If this is already a retry, don't try to refresh again
          if (_isRetry) {
            console.warn('401 Unauthorized after token refresh - redirecting to login');
            localStorage.removeItem('distributex_auth');
            window.location.href = '/login';
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          }

          // Try to refresh token
          logger.info('401 Unauthorized - attempting to refresh token');

          // If already refreshing, wait for it
          if (getIsRefreshing() && getRefreshPromise()) {
            const success = await getRefreshPromise()!;
            if (success) {
              return this.fetchApi<T>(endpoint, options, true);
            } else {
              console.warn('Token refresh failed - redirecting to login');
              localStorage.removeItem('distributex_auth');
              window.location.href = '/login';
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          }

          // Start refreshing
          const promise = refreshAccessToken();
          setRefreshState(true, promise);

          try {
            const success = await promise;

            if (success) {
              logger.info('Token refreshed successfully - retrying request');
              return this.fetchApi<T>(endpoint, options, true);
            } else {
              console.warn('Token refresh failed - redirecting to login');
              localStorage.removeItem('distributex_auth');
              window.location.href = '/login';
              throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          } finally {
            setRefreshState(false, null);
          }
        }
        if (response.status >= 500) {
          throw new Error('Lỗi server. Vui lòng thử lại sau.');
        }
        throw new Error(`Lỗi API: ${response.status} - ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Không thể kết nối đến server. Kiểm tra kết nối mạng hoặc CORS settings.');
      }
      throw error;
    }
  }

  async getOrders(): Promise<OrderListApiResponse> {
    return this.fetchApi<OrderListApiResponse>('/api/order/orders');
  }

  // Search orders by query
  async searchOrders(query: string): Promise<OrderListApiResponse> {
    return this.fetchApi<OrderListApiResponse>(`/api/order/orders/search?q=${encodeURIComponent(query)}`);
  }

  // Get order detail by ID
  async getOrderById(orderId: number): Promise<{success: boolean, message: string, data: ApiOrderResponse}> {
    return this.fetchApi<{success: boolean, message: string, data: ApiOrderResponse}>(`/api/order/orders/${orderId}`);
  }

  async updatePaymentStatus(orderId: number, paymentStatus: 'PAID' | 'UNPAID'): Promise<UpdatePaymentStatusResponse> {
    return this.fetchApi<UpdatePaymentStatusResponse>(`/api/order/orders/${orderId}/payment-status?paymentStatus=${paymentStatus}`, {
      method: 'PATCH',
    });
  }

  // Soft delete order
  async softDeleteOrder(orderId: number): Promise<{success: boolean, message: string}> {
    return this.fetchApi<{success: boolean, message: string}>(`/api/order/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Hard delete order
  async hardDeleteOrder(orderId: number): Promise<{success: boolean, message: string}> {
    return this.fetchApi<{success: boolean, message: string}>(`/api/order/orders/${orderId}/hard`, {
      method: 'DELETE',
    });
  }

  // Soft delete multiple orders (bulk) - Only PAID orders
  async bulkSoftDeleteOrders(orderIds: number[]): Promise<{
    success: boolean;
    message: string;
    data?: {
      successCount: number;
      failCount: number;
      failedOrders?: number[];
    };
  }> {
    return this.fetchApi<{
      success: boolean;
      message: string;
      data?: {
        successCount: number;
        failCount: number;
        failedOrders?: number[];
      };
    }>('/api/order/orders/bulk', {
      method: 'DELETE',
      body: JSON.stringify(orderIds),
    });
  }

  // Hard delete multiple orders (bulk)
  async bulkHardDeleteOrders(orderIds: number[]): Promise<{
    success: boolean;
    message: string;
    data?: {
      successCount: number;
      failCount: number;
      failedOrders?: number[];
    };
  }> {
    return this.fetchApi<{
      success: boolean;
      message: string;
      data?: {
        successCount: number;
        failCount: number;
        failedOrders?: number[];
      };
    }>('/api/order/orders/bulk/hard', {
      method: 'DELETE',
      body: JSON.stringify(orderIds),
    });
  }

  // Restore deleted order
  async restoreOrder(orderId: number): Promise<{success: boolean, message: string}> {
    return this.fetchApi<{success: boolean, message: string}>(`/api/order/orders/${orderId}/restore`, {
      method: 'PATCH',
    });
  }

  // Cập nhật trạng thái order item
  async updateOrderItemStatus(orderItemId: number, status: string): Promise<void> {
    logger.debug('Updating order item status', {
      orderItemId,
      status
    });

    const response = await this.fetchApi<{success: boolean, message: string}>(`/api/order/order-item/${orderItemId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update order item status');
    }

    logger.info('Order item status updated successfully');
  }

  // Get deleted orders
  async getDeletedOrders(): Promise<OrderListApiResponse> {
    return this.fetchApi<OrderListApiResponse>('/api/order/orders/deleted');
  }

  // Get dealer information by dealerId
  async getDealerInfo(dealerId: number): Promise<DealerApiResponse> {
    return this.fetchApi<DealerApiResponse>(`/api/user/dealer/${dealerId}?fields=companyName%2Cphone%2Cemail%2CaccountId`);
  }

  // Get orders by dealer ID
  async getOrdersByDealerId(
    dealerId: number,
    status?: 'PAID' | 'UNPAID',
    includeDeleted: boolean = false
  ): Promise<OrderListApiResponse> {
    let endpoint = `/api/order/orders/dealer/${dealerId}?includeDeleted=${includeDeleted}`;
    if (status) {
      endpoint += `&status=${status}`;
    }
    return this.fetchApi<OrderListApiResponse>(endpoint);
  }

  private getAuthToken(): string {
    // Use the same logic as api.ts
    const auth = localStorage.getItem('distributex_auth');
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        const token = authData.token;
        if (token) {
          return token;
        }
      } catch (error) {
        logger.error('Error parsing distributex_auth from localStorage', error);
      }
    }

    // No token found
    return '';
  }

  // Utility method to manually set token for testing
  setToken(token: string): void {
    const authData = {
      token: token,
      expiresIn: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
    localStorage.setItem('distributex_auth', JSON.stringify(authData));
  }

  // Utility method to check current token
  checkToken(): void {
    const token = this.getAuthToken();
    logger.debug('Auth token status for order service', {
      hasToken: !!token,
      preview: token ? `${token.substring(0, 20)}...` : null
    });
  }
}

export const orderService = new OrderService();

// Expose for debugging in console
if (typeof window !== 'undefined') {
  (window as any).orderService = orderService;
}