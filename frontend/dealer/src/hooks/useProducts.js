/**
 * React Query hooks for Products
 * Custom hooks for fetching and managing product data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI } from '../services/api';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { showSuccess, showAPIError } from '../utils/toast';

/**
 * Hook to fetch all products with optional filters
 * @param {object} filters - Optional filters (category, search, etc.)
 * @param {object} options - React Query options
 * @returns {object} Query result with products data
 */
export function useProducts(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      const response = await productAPI.getProducts(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch a single product by ID
 * @param {string|number} id - Product ID
 * @param {object} options - React Query options
 * @returns {object} Query result with product data
 */
export function useProduct(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const response = await productAPI.getProductById(id);
      return response.data;
    },
    enabled: !!id, // Only fetch if ID exists
    staleTime: 10 * 60 * 1000, // 10 minutes (product details change less frequently)
    ...options,
  });
}

/**
 * Hook to search products
 * @param {string} searchTerm - Search term
 * @param {object} options - React Query options
 * @returns {object} Query result with search results
 */
export function useProductSearch(searchTerm, options = {}) {
  return useQuery({
    queryKey: [...queryKeys.products.lists(), 'search', searchTerm],
    queryFn: async () => {
      const response = await productAPI.searchProducts(searchTerm);
      return response.data;
    },
    enabled: !!searchTerm && searchTerm.length >= 2, // Only search if term has 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch products by category
 * @param {string} category - Category name
 * @param {object} options - React Query options
 * @returns {object} Query result with products data
 */
export function useProductsByCategory(category, options = {}) {
  return useQuery({
    queryKey: [...queryKeys.products.lists(), 'category', category],
    queryFn: async () => {
      const response = await productAPI.getProductsByCategory(category);
      return response.data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to add product to cart (mutation)
 * @returns {object} Mutation object
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await productAPI.addToCart(productId, quantity);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate cart queries
      invalidateQueries.cart();

      // Show success toast
      showSuccess(`Đã thêm sản phẩm vào giỏ hàng`);
    },
    onError: (error) => {
      showAPIError(error, 'Không thể thêm sản phẩm vào giỏ hàng');
    },
  });
}

/**
 * Hook for prefetching product details (for hover/link effects)
 * @returns {function} Prefetch function
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (productId) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(productId),
      queryFn: async () => {
        const response = await productAPI.getProductById(productId);
        return response.data;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook to get featured/recommended products
 * @param {object} options - React Query options
 * @returns {object} Query result with featured products
 */
export function useFeaturedProducts(options = {}) {
  return useQuery({
    queryKey: [...queryKeys.products.lists(), 'featured'],
    queryFn: async () => {
      const response = await productAPI.getFeaturedProducts();
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (featured products change rarely)
    ...options,
  });
}
