import { LocalFallbackEngine } from './localFallback';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    let parsedBody: any = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body;
      }
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          // Trigger logout if token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth:unauthorized'));
          return {
            success: false,
            message: data?.message || 'Session expired',
          };
        }

        // On static hosting like GitHub Pages where /api/* endpoints are 404,
        // seamlessly fall back to client-side LocalFallbackEngine
        if (res.status === 404) {
          return LocalFallbackEngine.handleRequest<T>(options.method || 'GET', endpoint, parsedBody);
        }

        return {
          success: false,
          message: data?.message || `Request failed with status ${res.status}`,
        };
      }

      return data;
    } catch (err: any) {
      // Network failure or static deployment without backend -> fallback to client store
      return LocalFallbackEngine.handleRequest<T>(options.method || 'GET', endpoint, parsedBody);
    }
  }

  public get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
