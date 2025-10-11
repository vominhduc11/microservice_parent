/**
 * React Query hooks for Orders
 * Custom hooks for fetching and managing order data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../services/api';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { showSuccess, showAPIError, showPromise } from '../utils/toast';

/**
 * Hook to fetch all orders with optional filters
 * @param {object} filters - Optional filters (status, date range, etc.)
 * @param {object} options - React Query options
 * @returns {object} Query result with orders data
 */
export function useOrders(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async () => {
      const response = await orderAPI.getOrders(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (orders update frequently)
    ...options,
  });
}

/**
 * Hook to fetch a single order by ID
 * @param {string|number} id - Order ID
 * @param {object} options - React Query options
 * @returns {object} Query result with order data
 */
export function useOrder(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      const response = await orderAPI.getOrderById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to create a new order (mutation)
 * @returns {object} Mutation object
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await orderAPI.createOrder(orderData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate orders list
      invalidateQueries.orders();

      // Invalidate cart (order created from cart)
      invalidateQueries.cart();

      showSuccess('Đặt hàng thành công!');
    },
    onError: (error) => {
      showAPIError(error, 'Không thể tạo đơn hàng');
    },
  });
}

/**
 * Hook to cancel an order (mutation)
 * @returns {object} Mutation object
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const response = await orderAPI.cancelOrder(orderId);
      return response.data;
    },
    onSuccess: (data, orderId) => {
      // Invalidate specific order
      invalidateQueries.orderDetail(orderId);

      // Invalidate orders list
      invalidateQueries.orders();

      showSuccess('Đã hủy đơn hàng thành công');
    },
    onError: (error) => {
      showAPIError(error, 'Không thể hủy đơn hàng');
    },
  });
}

/**
 * Hook to confirm order payment (mutation)
 * @returns {object} Mutation object
 */
export function useConfirmOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentData }) => {
      const response = await orderAPI.confirmPayment(orderId, paymentData);
      return response.data;
    },
    onSuccess: (data, { orderId }) => {
      invalidateQueries.orderDetail(orderId);
      invalidateQueries.orders();
      showSuccess('Thanh toán đã được xác nhận');
    },
    onError: (error) => {
      showAPIError(error, 'Không thể xác nhận thanh toán');
    },
  });
}

/**
 * Hook to fetch order statistics
 * @param {object} options - React Query options
 * @returns {object} Query result with statistics
 */
export function useOrderStats(options = {}) {
  return useQuery({
    queryKey: [...queryKeys.orders.all, 'stats'],
    queryFn: async () => {
      const response = await orderAPI.getOrderStats();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Hook to track order status in real-time
 * Refetches every 30 seconds if order is in progress
 * @param {string|number} orderId - Order ID
 * @param {object} options - React Query options
 * @returns {object} Query result with order status
 */
export function useOrderTracking(orderId, options = {}) {
  return useQuery({
    queryKey: [...queryKeys.orders.detail(orderId), 'tracking'],
    queryFn: async () => {
      const response = await orderAPI.getOrderById(orderId);
      return response.data;
    },
    enabled: !!orderId,
    refetchInterval: (data) => {
      // Refetch every 30 seconds if order is in progress
      const inProgressStatuses = ['PENDING', 'PROCESSING', 'SHIPPING'];
      return data && inProgressStatuses.includes(data.status) ? 30000 : false;
    },
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}
