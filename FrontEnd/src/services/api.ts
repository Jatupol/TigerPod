// client/src/services/api.ts
// Environment-aware API client for development and production

import type { User, UserRole } from '../types/user';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000; // 30 seconds default
const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEVELOPMENT = import.meta.env.DEV;

console.log('🔧 API Client Configuration:', {
  mode: import.meta.env.MODE,
  apiBaseUrl: API_BASE_URL || '(using relative URLs)',
  apiPrefix: API_PREFIX,
  timeout: `${API_TIMEOUT}ms`,
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT
});

// ==================== TYPES ====================

// Re-export for backward compatibility
export type { User, UserRole };

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// ==================== CORE API CLIENT ====================

class ApiClient {

  /**
   * Build full API URL based on environment configuration
   */
  private buildUrl(endpoint: string): string {
    // If full URL provided, use as-is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Ensure endpoint starts with API_PREFIX
    const path = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;

    // In development with empty API_BASE_URL, use relative URLs (Vite proxy)
    // In production with API_BASE_URL set, use absolute URLs
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  }

  /**
   * Create fetch request with timeout
   */
  private async fetchWithTimeout(url: string, config: RequestInit, timeout: number = API_TIMEOUT): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const method = options.method || 'GET';

    if (IS_DEVELOPMENT) {
      console.log(`📡 ${method} ${url}`);
    }

    const config: RequestInit = {
      credentials: 'include', // Include session cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await this.fetchWithTimeout(url, config);

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      const hasJson = contentType && contentType.includes('application/json');

      let data: any;
      if (hasJson) {
        data = await response.json();
      } else {
        // Non-JSON response (e.g., 204 No Content)
        data = { success: response.ok };
      }

      if (!response.ok) {
        console.error(`❌ ${method} ${endpoint} - ${response.status}:`, data);
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          error: data.error || 'API_ERROR'
        };
      }

      if (IS_DEVELOPMENT) {
        console.log(`✅ ${method} ${endpoint} - Success`);
      }

      return data;

    } catch (error: any) {
      console.error(`❌ ${method} ${endpoint} - Error:`, error);

      // Handle different error types
      if (error.message?.includes('timeout')) {
        return {
          success: false,
          message: `Request timeout. The server took too long to respond.`,
          error: 'TIMEOUT_ERROR'
        };
      }

      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        const backendUrl = API_BASE_URL || 'backend server';
        return {
          success: false,
          message: `Cannot connect to ${backendUrl}. Please check:\n- Is the server running?\n- Is the URL correct?\n- Are there network/firewall issues?`,
          error: 'CONNECTION_ERROR'
        };
      }

      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: 'NETWORK_ERROR'
      };
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) url = `${endpoint}?${queryString}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Test connection to backend
  async testConnection(): Promise<{ connected: boolean; message: string; mode: string }> {
    try {
      const response = await this.get('/health');
      const connectionMode = API_BASE_URL
        ? 'Direct Connection'
        : 'Vite Proxy';

      return {
        connected: response.success,
        message: response.success
          ? `Connected successfully (${connectionMode})`
          : response.message || 'Health check failed',
        mode: connectionMode
      };
    } catch (error) {
      return {
        connected: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mode: 'Unknown'
      };
    }
  }

  // Get current API configuration (for debugging)
  getConfig() {
    return {
      baseUrl: API_BASE_URL || '(relative)',
      prefix: API_PREFIX,
      timeout: API_TIMEOUT,
      mode: import.meta.env.MODE,
      isProduction: IS_PRODUCTION,
      isDevelopment: IS_DEVELOPMENT
    };
  }
}

// ==================== AUTH SERVICE ====================

class AuthService {
  constructor(private api: ApiClient) {}

  async login(loginData: LoginData): Promise<User> {
    console.log('🔐 Logging in user:', loginData.username);
    
    const response = await this.api.post<User>('/auth/login', loginData);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    console.log('✅ Login successful');
    return response.data;
  }

  async logout(): Promise<void> {
    console.log('🚪 Logging out...');
    await this.api.post('/auth/logout');
    console.log('✅ Logout successful');
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/auth/profile');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get profile');
    }

    return response.data;
  }

  async checkAuth(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const user = await this.getProfile();
      return { isAuthenticated: true, user };
    } catch {
      return { isAuthenticated: false };
    }
  }
}

// ==================== SINGLETON INSTANCES ====================

export const api = new ApiClient();
export const authService = new AuthService(api);

export default api;

/*
=== ENVIRONMENT-AWARE API CLIENT ===

FEATURES:
✅ Environment-based configuration (dev/production)
✅ Automatic proxy routing in development
✅ Direct backend connection in production
✅ Request timeout with configurable duration
✅ Enhanced error handling (timeout, connection, API errors)
✅ Session cookie support (credentials: 'include')
✅ TypeScript type safety
✅ Comprehensive logging in development mode
✅ Non-JSON response handling

DEVELOPMENT MODE (npm run dev):
✅ Uses .env.development configuration
✅ Vite proxy routes /api requests to backend
✅ VITE_API_BASE_URL empty (uses relative URLs)
✅ Detailed console logging for debugging
✅ Example: http://localhost:80/api/login → Proxy → http://tnhkdds-app01:8021/api/login

PRODUCTION MODE (npm run build):
✅ Uses .env.production configuration
✅ VITE_API_BASE_URL set to production backend URL
✅ Direct API calls (no proxy needed)
✅ Minimal logging for performance
✅ Example: http://tnhkdds-app01:8021/api/login (direct)

CONFIGURATION FILES:
- .env.development: Development settings (uses Vite proxy)
- .env.production: Production settings (direct backend URL)
- .env.local: Local overrides (git-ignored, highest priority)

ENVIRONMENT VARIABLES:
- VITE_API_BASE_URL: Base URL for backend API
  * Development: '' (empty, uses Vite proxy)
  * Production: 'http://tnhkdds-app01:8021'
- VITE_API_PREFIX: API path prefix (default: /api)
- VITE_API_TIMEOUT: Request timeout in ms (default: 30000)
- VITE_BACKEND_HOST: Backend server hostname (for proxy)
- VITE_BACKEND_PORT: Backend server port (for proxy)

API CLIENT METHODS:
- api.get<T>(endpoint, params?) - GET request with query params
- api.post<T>(endpoint, data?) - POST request with body
- api.put<T>(endpoint, data?) - PUT request with body
- api.patch<T>(endpoint, data?) - PATCH request with body
- api.delete<T>(endpoint) - DELETE request
- api.testConnection() - Test backend connectivity
- api.getConfig() - Get current API configuration

ERROR TYPES:
- TIMEOUT_ERROR: Request exceeded timeout duration
- CONNECTION_ERROR: Cannot connect to backend server
- API_ERROR: Backend returned error response
- NETWORK_ERROR: Generic network failure

USAGE EXAMPLE:
```typescript
import api from '@/services/api';

// GET request with params
const result = await api.get<User[]>('/users', { page: 1, limit: 10 });

// POST request with body
const login = await api.post<AuthData>('/auth/login', { username, password });

// Check connection
const status = await api.testConnection();
console.log(status.connected, status.mode);
```

HOW TO DEPLOY:
1. Update .env.production with your production backend URL
2. Build: npm run build
3. Deploy dist folder to web server
4. Ensure backend is running on configured host:port
5. Test connection using browser console: api.testConnection()
*/