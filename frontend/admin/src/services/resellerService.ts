import { apiRequest } from './api';

export interface ResellerRegistrationRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  city: string;
}

export interface ResellerRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    message: string;
  } | null;
  error: string | null;
  timestamp: string;
}

export const registerReseller = async (
  data: ResellerRegistrationRequest
): Promise<ResellerRegistrationResponse> => {
  return await apiRequest<ResellerRegistrationResponse>('/api/auth/reseller/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};