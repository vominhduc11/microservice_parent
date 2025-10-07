import { Product, ProductCreateRequest, ProductUpdateRequest, ProductResponse, ProductListResponse } from '@/types';
import { refreshAccessToken, getIsRefreshing, getRefreshPromise, setRefreshState } from './api';

// Empty base URL for nginx proxy to work (endpoints already have /api prefix)
const API_BASE_URL = '';

class ProductService {
  private async request<T>(endpoint: string, options: RequestInit = {}, _isRetry: boolean = false): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

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
        console.log('401 Unauthorized - attempting to refresh token');

        // If already refreshing, wait for it
        if (getIsRefreshing() && getRefreshPromise()) {
          const success = await getRefreshPromise()!;
          if (success) {
            return this.request<T>(endpoint, options, true);
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
            console.log('Token refreshed successfully - retrying request');
            return this.request<T>(endpoint, options, true);
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
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // POST /api/admin/products - Tạo sản phẩm mới
  async createProduct(productData: ProductCreateRequest): Promise<ProductResponse> {
    return this.request<ProductResponse>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // PUT /api/admin/products/{id} - Cập nhật sản phẩm
  async updateProduct(id: string, productData: ProductUpdateRequest): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // GET /api/admin/products - Lấy danh sách sản phẩm
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/admin/products?${queryString}` : '/api/admin/products';
    
    return this.request<ProductListResponse>(endpoint);
  }

  // GET /api/admin/products/{id} - Lấy chi tiết sản phẩm
  async getProductById(id: string): Promise<ProductResponse> {
    return this.request<ProductResponse>(`/api/admin/products/${id}`);
  }

  // DELETE /api/admin/products/{id} - Xóa sản phẩm
  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  // GET /api/product/{productId} - Lấy thông tin sản phẩm cơ bản (port 8080)
  async getProductInfo(productId: number, fields: string = 'name,image', _isRetry: boolean = false): Promise<{
    success: boolean;
    message: string;
    data: {
      name: string;
      image: string;
    };
  }> {
    const url = `/api/product/${productId}?fields=${encodeURIComponent(fields)}`;

    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

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
        console.log('401 Unauthorized - attempting to refresh token');

        // If already refreshing, wait for it
        if (getIsRefreshing() && getRefreshPromise()) {
          const success = await getRefreshPromise()!;
          if (success) {
            return this.getProductInfo(productId, fields, true);
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
            console.log('Token refreshed successfully - retrying request');
            return this.getProductInfo(productId, fields, true);
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
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // GET /api/product/product-serials/{productId}/inventory - Lấy thông tin inventory sản phẩm (port 8080)
  async getProductInventory(id: string, _isRetry: boolean = false): Promise<{
    success: boolean;
    message: string;
    data: {
      productId: number;
      productName: string;
      availableCount: number;
      soldCount: number;
      damagedCount: number;
      totalCount: number;
    };
  }> {
    const url = `/api/product/product-serials/${id}/inventory`;

    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

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
        console.log('401 Unauthorized - attempting to refresh token');

        // If already refreshing, wait for it
        if (getIsRefreshing() && getRefreshPromise()) {
          const success = await getRefreshPromise()!;
          if (success) {
            return this.getProductInventory(id, true);
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
            console.log('Token refreshed successfully - retrying request');
            return this.getProductInventory(id, true);
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
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Helper method to get auth token
  private getAuthToken(): string | null {
    const auth = localStorage.getItem('distributex_auth');
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        return authData.token;
      } catch (error) {
        console.error('Error parsing auth data from localStorage:', error);
      }
    }
    return 'demo-admin-token';
  }

  // Validation helper - Kiểm tra dữ liệu trước khi gửi
  validateProductData(productData: Partial<ProductCreateRequest>): string[] {
    const errors: string[] = [];

    // Required fields
    if (!productData.name || productData.name.length < 3 || productData.name.length > 200) {
      errors.push('Tên sản phẩm phải có từ 3-200 ký tự');
    }


    if (!productData.sku) {
      errors.push('SKU là bắt buộc');
    }

    // Specifications validation (now array format)
    if (!productData.specifications || !Array.isArray(productData.specifications) || productData.specifications.length === 0) {
      errors.push('Thông số kỹ thuật là bắt buộc');
    }


    return errors;
  }

  // Helper - Chuyển đổi từ form data sang API request - backend auto-generates id
  mapFormDataToApiRequest(formData: Partial<Product>): Partial<ProductCreateRequest> {
    return {
      name: formData.name || '',
      subtitle: formData.subtitle,
      descriptions: formData.descriptions,
      longDescription: formData.longDescription,

      specifications: formData.specifications || [],

      warranty: formData.warranty,
      targetAudience: formData.targetAudience,
      useCases: formData.useCases,
      relatedProductIds: formData.relatedProductIds,
      accessories: formData.accessories,

      popularity: formData.popularity,
      rating: formData.rating,
      reviewCount: formData.reviewCount,
      sku: formData.sku || '',

      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,

      images: formData.images,
      videos: formData.videos,

      publishedAt: formData.publishedAt,
    };
  }
}

export const productService = new ProductService();
export default productService;
