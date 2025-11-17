// client/src/config/api.config.ts
// Centralized API Configuration from Environment Variables

/**
 * API Configuration - Environment-aware settings
 *
 * This configuration is used across all service files to ensure
 * consistent API endpoint construction based on environment.
 *
 * Environment Variables:
 * - VITE_API_BASE_URL: Base URL for API (empty for relative URLs in dev)
 * - VITE_API_PREFIX: API prefix path (default: /api)
 * - VITE_BACKEND_PORT: Backend port (for reference)
 */

// ==================== ENVIRONMENT CONFIGURATION ====================

export const API_CONFIG = {
  // Base URL for API requests (empty in development to use Vite proxy)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',

  // API prefix (default: /api)
  PREFIX: import.meta.env.VITE_API_PREFIX || '/api',

  // Backend port (for reference and proxy configuration)
  BACKEND_PORT: import.meta.env.VITE_BACKEND_PORT || '8021',

  // Environment flags
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Build full API URL from endpoint
 *
 * @param endpoint - API endpoint (e.g., '/customers', '/auth/login')
 * @returns Full URL based on environment configuration
 *
 * Examples:
 * - Development: buildApiUrl('/customers') → '/api/customers' (uses proxy)
 * - Production: buildApiUrl('/customers') → 'http://server:8021/api/customers'
 */
export function buildApiUrl(endpoint: string): string {
  // If endpoint already has the prefix, use as-is
  const path = endpoint.startsWith(API_CONFIG.PREFIX)
    ? endpoint
    : `${API_CONFIG.PREFIX}${endpoint}`;

  // In development (or if BASE_URL is empty), use relative URLs with Vite proxy
  // In production, use full URL with base
  return API_CONFIG.BASE_URL ? `${API_CONFIG.BASE_URL}${path}` : path;
}

/**
 * Build base URL for a specific entity
 *
 * @param entityPath - Entity path (e.g., 'customers', 'defects', 'auth')
 * @returns Base URL for the entity
 *
 * Examples:
 * - apiBaseUrl('customers') → '/api/customers'
 * - apiBaseUrl('/customers') → '/api/customers' (handles leading slash)
 */
export function apiBaseUrl(entityPath: string): string {
  // Remove leading slash if present
  const cleanPath = entityPath.startsWith('/') ? entityPath.slice(1) : entityPath;
  return buildApiUrl(`/${cleanPath}`);
}

/**
 * Log API configuration on startup
 */
export function logApiConfig(): void {
  console.log('🔧 API Configuration:', {
    mode: API_CONFIG.MODE,
    baseUrl: API_CONFIG.BASE_URL || '(using relative URLs with proxy)',
    prefix: API_CONFIG.PREFIX,
    backendPort: API_CONFIG.BACKEND_PORT,
    isProduction: API_CONFIG.IS_PRODUCTION,
    isDevelopment: API_CONFIG.IS_DEVELOPMENT,
  });
}

// Log configuration on module load (only once)
if (typeof window !== 'undefined') {
  logApiConfig();
}

// ==================== DEFAULT EXPORT ====================

export default API_CONFIG;

/*
=== API CONFIGURATION GUIDE ===

USAGE IN SERVICES:

// Import the config
import { apiBaseUrl } from '@/config/api.config';

// Use in service class
class MyService {
  private readonly baseUrl = apiBaseUrl('my-entity');
  // Now baseUrl will be '/api/my-entity' or 'http://server:8021/api/my-entity'
}

ENVIRONMENT FILES:

Development (.env.development):
  VITE_API_BASE_URL=          # Empty to use Vite proxy
  VITE_API_PREFIX=/api
  VITE_BACKEND_HOST=localhost # Backend server host (or tnhkdds-app01)
  VITE_BACKEND_PORT=8021      # Backend server port

Production (.env.production):
  VITE_API_BASE_URL=http://your-server:8021
  VITE_API_PREFIX=/api
  VITE_BACKEND_HOST=your-server
  VITE_BACKEND_PORT=8021

BENEFITS:
✅ Single source of truth for API configuration
✅ Environment-aware (dev vs production)
✅ Consistent across all services
✅ Easy to update and maintain
✅ Type-safe configuration
*/
