/**
 * React Query Client Configuration
 * Centralized configuration for data fetching, caching, and synchronization
 */

import { QueryClient } from '@tanstack/react-query';
import { showError, showNetworkError } from '../utils/toast';

/**
 * Default query options
 */
const defaultQueryOptions = {
  queries: {
    // Stale time: Data considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Cache time: Keep unused data in cache for 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

    // Retry failed requests
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 2 times for 5xx errors
      return failureCount < 2;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus (good for keeping data fresh)
    refetchOnWindowFocus: true,

    // Refetch on reconnect
    refetchOnReconnect: true,

    // Don't refetch on mount if data is fresh
    refetchOnMount: true,

    // Network mode
    networkMode: 'online',
  },

  mutations: {
    // Retry mutations once
    retry: 1,

    // Network mode for mutations
    networkMode: 'online',

    // Global error handler for mutations
    onError: (error) => {
      // Check if it's a network error
      if (!error.response) {
        showNetworkError();
      } else {
        // Let individual mutations handle their own errors
        console.error('Mutation error:', error);
      }
    },
  },
};

/**
 * Create and configure the Query Client
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * Query Keys Factory
 * Centralized query key management for consistency
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    list: (filters) => [...queryKeys.products.lists(), filters],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id) => [...queryKeys.products.details(), id],
  },

  // Orders
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    list: (filters) => [...queryKeys.orders.lists(), filters],
    details: () => [...queryKeys.orders.all, 'detail'],
    detail: (id) => [...queryKeys.orders.details(), id],
  },

  // Cart
  cart: {
    all: ['cart'],
    items: () => [...queryKeys.cart.all, 'items'],
  },

  // Warranty
  warranty: {
    all: ['warranty'],
    lists: () => [...queryKeys.warranty.all, 'list'],
    list: (filters) => [...queryKeys.warranty.lists(), filters],
    details: () => [...queryKeys.warranty.all, 'detail'],
    detail: (id) => [...queryKeys.warranty.details(), id],
  },

  // Dealer
  dealer: {
    all: ['dealer'],
    profile: () => [...queryKeys.dealer.all, 'profile'],
  },

  // Blog
  blog: {
    all: ['blog'],
    lists: () => [...queryKeys.blog.all, 'list'],
    list: (filters) => [...queryKeys.blog.lists(), filters],
    details: () => [...queryKeys.blog.all, 'detail'],
    detail: (id) => [...queryKeys.blog.details(), id],
  },
};

/**
 * Invalidate query helpers
 */
export const invalidateQueries = {
  products: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  productDetail: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) }),

  orders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
  orderDetail: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) }),

  cart: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }),

  warranty: () => queryClient.invalidateQueries({ queryKey: queryKeys.warranty.all }),

  dealer: () => queryClient.invalidateQueries({ queryKey: queryKeys.dealer.all }),

  blog: () => queryClient.invalidateQueries({ queryKey: queryKeys.blog.all }),
};

/**
 * Prefetch helpers for better UX
 */
export const prefetchQueries = {
  productDetail: async (id) => {
    const { productAPI } = await import('../services/api');
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => productAPI.getProductById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  orderDetail: async (id) => {
    const { orderAPI } = await import('../services/api');
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(id),
      queryFn: () => orderAPI.getOrderById(id),
      staleTime: 5 * 60 * 1000,
    });
  },
};

/**
 * Set query data helpers (for optimistic updates)
 */
export const setQueryData = {
  updateProduct: (id, updater) => {
    queryClient.setQueryData(queryKeys.products.detail(id), updater);
  },

  updateOrder: (id, updater) => {
    queryClient.setQueryData(queryKeys.orders.detail(id), updater);
  },

  updateCart: (updater) => {
    queryClient.setQueryData(queryKeys.cart.items(), updater);
  },
};

/**
 * Get query data helpers
 */
export const getQueryData = {
  product: (id) => queryClient.getQueryData(queryKeys.products.detail(id)),
  order: (id) => queryClient.getQueryData(queryKeys.orders.detail(id)),
  cart: () => queryClient.getQueryData(queryKeys.cart.items()),
};

export default queryClient;
