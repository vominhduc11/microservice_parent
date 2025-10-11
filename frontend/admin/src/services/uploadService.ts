import { apiRequest, refreshAccessToken, getIsRefreshing, getRefreshPromise, setRefreshState } from './api';
import { ApiResponse } from '@/types';
import { env } from '@/config/env';

// Helper function to get auth token - matching api.ts pattern
const getAuthToken = (): string | null => {
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
};

export interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  message?: string;
  filename?: string;
  size?: number;
  type?: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message?: string;
}

class UploadService {
  async uploadImage(file: File, folder: string = 'products', _isRetry: boolean = false): Promise<UploadResponse> {
    try {
      console.log('Starting image upload:', { fileName: file.name, fileSize: file.size, folder });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch(`${env.apiUrl}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData,
      });

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
            return this.uploadImage(file, folder, true);
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
            console.log('Token refreshed successfully - retrying upload');
            return this.uploadImage(file, folder, true);
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

      const result = await response.json();

      if (result.success) {
        console.log('Upload successful:', result);
        return {
          success: true,
          url: result.data.secure_url || result.data.url,
          publicId: result.data.public_id,
          filename: file.name,
          size: file.size,
          type: file.type
        };
      } else {
        console.error('Upload failed - API returned success: false', result);
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }


  async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image', _isRetry: boolean = false): Promise<boolean> {
    try {
      console.log('Starting file delete:', { publicId, resourceType });

      const response = await fetch(`${env.apiUrl}/api/media/delete?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

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
            return this.deleteFile(publicId, resourceType, true);
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
            console.log('Token refreshed successfully - retrying delete');
            return this.deleteFile(publicId, resourceType, true);
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

      const result = await response.json();

      if (result.success) {
        console.log('File deleted successfully');
        return true;
      } else {
        console.error('Delete failed - API returned success: false', result);
        return false;
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }


  // Helper method để extract filename từ URL
  extractFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.substring(pathname.lastIndexOf('/') + 1);
    } catch {
      // Nếu không parse được URL, tách bằng cách đơn giản
      return url.substring(url.lastIndexOf('/') + 1);
    }
  }

  // Validate file type
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Vui lòng chọn file hình ảnh (JPG, PNG, GIF, etc.)' };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Kích thước file không được vượt quá 5MB' };
    }

    return { valid: true };
  }

}

export const uploadService = new UploadService();