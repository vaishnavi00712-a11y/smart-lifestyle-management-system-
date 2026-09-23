import { LocalFallbackEngine } from './localFallback';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export function isStaticEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const customApiBase = (import.meta as any).env?.VITE_API_BASE_URL;
  // If an external backend URL was explicitly configured (e.g. https://api.myserver.com), use network requests
  if (customApiBase && typeof customApiBase === 'string' && customApiBase.startsWith('http')) {
    return false;
  }

  // GitHub Pages hosts static files only (no Express/Node.js backend)
  const hostname = window.location.hostname;
  return (
    hostname.endsWith('github.io') ||
    hostname.includes('.pages.dev') ||
    hostname.includes('.netlify.app') ||
    window.location.protocol === 'file:'
  );
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
    let parsedBody: any = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch {
        parsedBody = options.body;
      }
    } else if (options.body) {
      parsedBody = options.body;
    }

    // On static hosting like GitHub Pages, no Node.js backend exists for /api/*.
    // Direct requests will immediately fail with HTTP 405 (Method Not Allowed) on POST/PUT
    // or 404 on GET. Route directly to the local storage engine.
    if (isStaticEnvironment()) {
      return LocalFallbackEngine.handleRequest<T>(options.method || 'GET', endpoint, parsedBody);
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, { ...options, headers });
      const contentType = res.headers.get('content-type') || '';

      // If the static server returned an HTML file (like 404.html or index.html) instead of JSON
      if (contentType.includes('text/html')) {
        return LocalFallbackEngine.handleRequest<T>(options.method || 'GET', endpoint, parsedBody);
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          const cleanEndpoint = endpoint.split('?')[0].replace(/^\/api/, '');
          const isAuthEndpoint = cleanEndpoint.startsWith('/auth/login') || cleanEndpoint.startsWith('/auth/register');

          if (!isAuthEndpoint) {
            const hadToken = !!localStorage.getItem('token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (hadToken) {
              window.dispatchEvent(new Event('auth:unauthorized'));
            }
          }

          return {
            success: false,
            message: data?.message || (isAuthEndpoint ? 'Invalid email or password.' : 'Session expired'),
          };
        }

        // On static hosting: 405 (Method Not Allowed), 404 (Not Found), 501, 403, 502, 503, 504
        if ([403, 404, 405, 500, 501, 502, 503, 504].includes(res.status)) {
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
