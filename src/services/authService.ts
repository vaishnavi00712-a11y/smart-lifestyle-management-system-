import { api, ApiResponse } from './api';
import { User } from '../types';

export interface AuthResponseData {
  token: string;
  user: User;
}

export const authService = {
  async register(payload: {
    name: string;
    email: string;
    password: string;
    age?: number;
    lifestyle_goal?: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return api.post<AuthResponseData>('/auth/register', payload);
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return api.post<AuthResponseData>('/auth/login', payload);
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return api.get<User>('/auth/me');
  },

  async updateProfile(payload: {
    name?: string;
    age?: number;
    lifestyle_goal?: string;
  }): Promise<ApiResponse<User>> {
    return api.put<User>('/users/me', payload);
  },

  async logout(): Promise<ApiResponse<void>> {
    return api.post<void>('/auth/logout');
  },
};
