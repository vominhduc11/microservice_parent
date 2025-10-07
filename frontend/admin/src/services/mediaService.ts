import { refreshAccessToken, getIsRefreshing, getRefreshPromise, setRefreshState } from './api';

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
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class MediaService {
  private baseUrl = import.meta.env.VITE_API_URL || '';



  async deleteMedia(publicId: string, _isRetry: boolean = false): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/media/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ publicId })
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
            return this.deleteMedia(publicId, true);
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
            return this.deleteMedia(publicId, true);
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

      return await response.json();
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  }
}

export const mediaService = new MediaService();