// client/src/services/defectService.ts

/**
 * Defect Service - Frontend API service for Defect entity
 *
 * Fixed to match the SERIAL ID entity pattern implementation:
 * - Uses ID instead of CODE for primary key
 * - Matches server-side API endpoints: /api/defects/:id
 * - Implements all custom defect endpoints from backend
 * - Complete separation architecture compliance
 * - Uses environment-based API configuration
 */

import { apiBaseUrl } from '../config/api.config';

// ==================== TYPES & INTERFACES ====================

export interface Defect {
  id: number;                     // SERIAL PRIMARY KEY
  name: string;                   // VARCHAR(100) UNIQUE NOT NULL
  description: string;            // TEXT
  defect_group?: string;          // VARCHAR(100) - Defect group/category
  is_active: boolean;             // BOOLEAN DEFAULT true
  created_by: number;             // INT DEFAULT 0
  updated_by: number;             // INT DEFAULT 0
  created_at: Date;             // ISO timestamp string
  updated_at: Date;             // ISO timestamp string
}

export interface CreateSerialIdRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
}

export interface UpdateSerialIdRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  updated_by?: number;
}
export interface SerialIdFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateSerialIdFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface SerialIdQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof Defect;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface SerialIdResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SerialIdStats {
  total_defects: number;
  active_defects: number;
  inactive_defects: number;
  recent_defects: number;
}

// ============ DEFECT SERVICE CLASS ============

class DefectApiService {
  private readonly baseUrl = apiBaseUrl('defects');

  // ============ HELPER METHODS ============

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<SerialIdResponse<T>> {
    try {
      console.log(`📡 Defect Service - Making request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`📡 Defect Service - Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ Defect Service - HTTP Error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('📡 Defect Service - Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Defect Service - Network error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
      // Special handling for boolean false values (important for isActive filter)
      else if (typeof value === 'boolean' && value === false) {
        searchParams.append(key, String(value));
      }
    });

    // More aggressive cache busting
    searchParams.append('_cacheBuster', Math.random().toString(36).substring(2));
    searchParams.append('_timestamp', Date.now().toString());

    return searchParams.toString();
  }

  // ============ CRUD OPERATIONS ============

  public async get(params: SerialIdQueryParams = {}): Promise<SerialIdResponse<Defect[]>> {
    console.log('🔧 Defect Service - get called with params:', {
      params,
      isActiveValue: params.isActive,
      isActiveType: typeof params.isActive
    });

    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    console.log('🔧 Defect Service - built URL:', url);

    return this.makeRequest<Defect[]>(url);
  }

  public async getByCode(id: number): Promise<SerialIdResponse<Defect>> {
    return this.makeRequest<Defect>(`${this.baseUrl}/${id}`);
  }

  public async create(data: SerialIdFormData): Promise<SerialIdResponse<Defect>> {
    return this.makeRequest<Defect>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async update(id: number, data: UpdateSerialIdFormData): Promise<SerialIdResponse<Defect>> {
    return this.makeRequest<Defect>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async delete(id: number): Promise<SerialIdResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  public async toggleStatus(id: number): Promise<SerialIdResponse<Defect>> {
    console.log(`🔄 Defect Service - Toggling status for ID: ${id}`);

    try {
      const response = await this.makeRequest<Defect>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
      });

      console.log('🔄 Defect Service - Toggle response:', response);
      return response;
    } catch (error) {
      console.error('❌ Defect Service - Toggle error:', error);
      throw error;
    }
  }

  // ============ UTILITY OPERATIONS ============

  public async getActive(): Promise<SerialIdResponse<Defect[]>> {
    return this.makeRequest<Defect[]>(`${this.baseUrl}/utils/active`);
  }

  public async getStats(): Promise<SerialIdResponse<SerialIdStats>> {
    console.log('📊 Defect Service - Getting statistics');

    const response = await this.makeRequest<any>(`${this.baseUrl}/statistics`);

    console.log('📊 Defect Service - Stats response:', response);

    // Handle the actual API response structure (API returns data.totals.{all, active, inactive})
    if (response.success && response.data) {
      console.log('✅ Defect Service - Raw API data:', response.data);

      let statsData;
      if (response.data.totals) {
        // SerialId API returns { totals: { all, active, inactive } }
        statsData = {
          total: response.data.totals.all || 0,
          active: response.data.totals.active || 0,
          inactive: response.data.totals.inactive || 0
        };
      } else if (response.data.overview) {
        // Some APIs return { overview: { total, active, inactive } }
        statsData = {
          total: response.data.overview.total || 0,
          active: response.data.overview.active || 0,
          inactive: response.data.overview.inactive || 0
        };
      } else {
        // Direct structure { total, active, inactive }
        statsData = {
          total: response.data.total || 0,
          active: response.data.active || 0,
          inactive: response.data.inactive || 0
        };
      }

      console.log('✅ Defect Service - Processed stats:', statsData);

      return {
        success: true,
        data: statsData,
        message: response.message || 'Statistics retrieved successfully'
      };
    }

    console.log('❌ Defect Service - Invalid response structure');
    console.log('Expected: { data: { totals: { all, active, inactive } } }');
    console.log('Received:', response);

    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        inactive: 0
      },
      message: response.message || 'Failed to load statistics'
    };
  }

  // ============ VALIDATION OPERATIONS ============

  public async validateDefectName(name: string, excludeCode?: string): Promise<SerialIdResponse<{ isValid: boolean; message?: string }>> {
    const params: Record<string, string> = { name };
    if (excludeCode) {
      params.excludeCode = excludeCode;
    }

    const queryString = this.buildQueryString(params);
    return this.makeRequest<{ isValid: boolean; message?: string }>(`${this.baseUrl}/validate/name?${queryString}`);
  }

  // ============ DROPDOWN HELPER ============

  public async getDropdown(): Promise<Array<{ value: number; label: string }>> {
    try {
      const result = await this.getActive();
      if (result.success && result.data) {
        return result.data.map(defect => ({
          value: defect.id,
          label: `${defect.id} - ${defect.name}`
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}

// ============ SINGLETON EXPORT ============
export interface DefectStats {
  total: number;
  active: number;
  inactive: number;
  total_defects: number;
  active_defects: number;
  inactive_defects: number;
}
export const defectService = new DefectApiService();
export default defectService;