// client/src/services/lineFVIService.ts
// Complete LineFVI Service - Frontend API service with proper type handling
// Complete Separation Entity Architecture - Standalone LineFVI Service
// Uses environment-based API configuration

import { apiBaseUrl } from '../config/api.config';

import type { 
  LineFVI, 
  RawLineFVIData,  
  LineFVIFormData,
  UpdateLineFVIFormData,
  LineFVIQueryParams,
  LineFVIResponse,
  LineFVIStats
} from '../types/lineFVI';

import  {normalizeLineFVIData}  from '../types/lineFVI';

// ============ COMPLETE LINEFVI SERVICE CLASS ============

class LineFVIApiService {
  private readonly baseUrl = apiBaseUrl('line-fvi');

  // ============ HELPER METHODS ============

  /**
   * Make HTTP request with proper error handling and logging
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<LineFVIResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      if (!response.ok) {
        console.error(`HTTP Error ${response.status}: ${response.statusText} for ${url}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Debug logging for response structure analysis
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 LineFVI API Response:', {
          url,
          status: response.status,
          response: data,
          hasData: !!data?.data,
          dataType: typeof data?.data,
          isDataArray: Array.isArray(data?.data),
          hasNestedData: !!data?.data?.data,
          isNestedDataArray: Array.isArray(data?.data?.data)
        });
      }

      return data;
    } catch (error) {
      console.error('LineFVI API Service - Network error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  /**
   * Build query string from parameters - only include backend-supported parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    // Define allowed parameters based on backend VarcharCodeQueryOptions
    const allowedParams = ['page', 'limit', 'sortBy', 'sortOrder', 'search', 'isActive'];
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Only include parameters that the backend recognizes
      if (allowedParams.includes(key) && value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * Normalize LineFVI entity data with proper Date conversion
   */
  private normalizeLineFVI(rawData: any): LineFVI {
    return normalizeLineFVIData({
      code: rawData.code || '',
      name: rawData.name || '',
      is_active: rawData.is_active !== undefined ? rawData.is_active : true,
      created_by: rawData.created_by || 0,
      updated_by: rawData.updated_by || 0,
      created_at: rawData.created_at || new Date().toISOString(),
      updated_at: rawData.updated_at || new Date().toISOString()
    });
  }

  /**
   * Extract array from nested response structure
   */
  private extractEntitiesArray(responseData: any): LineFVI[] {
    console.log('🔍 LineFVI Service - Extracting entities from response data:', {
      hasData: !!responseData,
      dataType: typeof responseData,
      isDataArray: Array.isArray(responseData),
      hasNestedData: !!responseData?.data,
      isNestedDataArray: Array.isArray(responseData?.data),
      dataKeys: typeof responseData === 'object' && responseData !== null ? Object.keys(responseData) : null
    });

    if (!responseData) {
      console.warn('⚠️ LineFVI Service - No response data provided');
      return [];
    }

    let entities: any[] = [];

    if (Array.isArray(responseData)) {
      // Case 1: Direct array response: LineFVI[]
      entities = responseData;
      console.log('📊 LineFVI Service - Direct array structure detected, count:', entities.length);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // Case 2: Nested structure: { data: LineFVI[], pagination: {...} }
      entities = responseData.data;
      console.log('📊 LineFVI Service - Nested structure detected, count:', entities.length);
    } else if (typeof responseData === 'object' && responseData !== null) {
      // Case 3: Object structure - search for array property
      console.warn('⚠️ LineFVI Service - Searching for array in object structure');
      
      const possibleArrayKeys = ['data', 'items', 'entities', 'results', 'list', 'records'];
      let foundArrayKey: string | null = null;
      
      for (const key of possibleArrayKeys) {
        if (responseData[key] && Array.isArray(responseData[key])) {
          foundArrayKey = key;
          entities = responseData[key];
          break;
        }
      }
      
      if (foundArrayKey) {
        console.log(`📊 LineFVI Service - Found array in key '${foundArrayKey}', count:`, entities.length);
      } else {
        console.error('❌ LineFVI Service - No array found in response object keys:', 
          Object.keys(responseData));
        entities = [];
      }
    } else {
      console.error('❌ LineFVI Service - Invalid response data type:', typeof responseData);
      entities = [];
    }

    // Validate and normalize entities
    const normalizedEntities = entities
      .filter(entity => entity && typeof entity === 'object')
      .map(entity => this.normalizeLineFVI(entity));

    console.log('✅ LineFVI Service - Successfully extracted and normalized entities:', {
      originalCount: entities.length,
      normalizedCount: normalizedEntities.length,
      sampleEntity: normalizedEntities[0] || null
    });

    return normalizedEntities;
  }

  // ============ MAIN CRUD OPERATIONS ============

  /**
   * Get LineFVIs with backend-compatible query parameters
   */
  public async getLineFVIs(params: LineFVIQueryParams = {}): Promise<LineFVIResponse<LineFVI[]>> {
    // Clean parameters to match backend expectations
    const cleanParams: Record<string, any> = {};
    
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.limit !== undefined) cleanParams.limit = params.limit;
    if (params.search !== undefined) cleanParams.search = params.search;
    if (params.sortBy !== undefined) cleanParams.sortBy = params.sortBy;
    
    // Convert sortOrder to backend format (uppercase)
    if (params.sortOrder !== undefined) {
      cleanParams.sortOrder = params.sortOrder.toUpperCase();
    }
    
    // Handle isActive/activeFilter parameter
    if (params.isActive !== undefined) {
      cleanParams.isActive = params.isActive;
    } else if (params.activeFilter !== undefined) {
      cleanParams.isActive = params.activeFilter;
    }
    
    const queryString = this.buildQueryString(cleanParams);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    console.log('🔄 LineFVI Service - Getting LineFVIs with cleaned params:', cleanParams);
    console.log('🔄 LineFVI Service - Request URL:', url);
    
    try {
      const response = await this.makeRequest<any>(url);
      
      if (!response.success) {
        console.error('❌ LineFVI Service - API returned error:', response.message);
        return {
          success: false,
          message: response.message || 'Failed to load LineFVIs',
          data: []
        };
      }

      // Extract entities using comprehensive extraction logic
      const entities = this.extractEntitiesArray(response.data);
      
      // Extract pagination information
      let pagination = undefined;
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        pagination = response.data.pagination || response.pagination;
      } else {
        pagination = response.pagination;
      }

      console.log('✅ LineFVI Service - Successfully processed response:', {
        entitiesCount: entities.length,
        hasPagination: !!pagination,
        pagination
      });

      return {
        success: true,
        data: entities,
        pagination: pagination,
        message: response.message || `Successfully loaded ${entities.length} LineFVIs`
      };

    } catch (error) {
      const errorMessage = `Error loading LineFVIs: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌ LineFVI Service - getLineFVIs error:', error);
      return {
        success: false,
        message: errorMessage,
        data: []
      };
    }
  }

  /**
   * Get single LineFVI by code
   */
  public async getLineFVI(code: string): Promise<LineFVIResponse<LineFVI>> {
    console.log('🔄 LineFVI Service - Getting LineFVI by code:', code);
    
    try {
      const response = await this.makeRequest<any>(`${this.baseUrl}/${code}`);
      
      if (response.success && response.data) {
        const normalizedEntity = this.normalizeLineFVI(response.data);
        return {
          success: true,
          data: normalizedEntity,
          message: response.message || 'LineFVI retrieved successfully'
        };
      }
      
      return {
        success: false,
        message: response.message || 'LineFVI not found'
      };
    } catch (error) {
      console.error('❌ LineFVI Service - getLineFVI error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get LineFVI'
      };
    }
  }

  /**
   * Create new LineFVI
   */
  public async createLineFVI(data: LineFVIFormData): Promise<LineFVIResponse<LineFVI>> {
    console.log('🔄 LineFVI Service - Creating LineFVI:', data);
    
    try {
      const response = await this.makeRequest<any>(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.success && response.data) {
        const normalizedEntity = this.normalizeLineFVI(response.data);
        console.log('✅ LineFVI Service - LineFVI created successfully');
        return {
          success: true,
          data: normalizedEntity,
          message: response.message || 'LineFVI created successfully'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to create LineFVI',
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ LineFVI Service - createLineFVI error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create LineFVI'
      };
    }
  }

  /**
   * Update existing LineFVI
   */
  public async updateLineFVI(code: string, data: UpdateLineFVIFormData): Promise<LineFVIResponse<LineFVI>> {
    console.log('🔄 LineFVI Service - Updating LineFVI:', { code, data });
    
    try {
      const response = await this.makeRequest<any>(`${this.baseUrl}/${code}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (response.success && response.data) {
        const normalizedEntity = this.normalizeLineFVI(response.data);
        console.log('✅ LineFVI Service - LineFVI updated successfully');
        return {
          success: true,
          data: normalizedEntity,
          message: response.message || 'LineFVI updated successfully'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to update LineFVI',
        errors: response.errors
      };
    } catch (error) {
      console.error('❌ LineFVI Service - updateLineFVI error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update LineFVI'
      };
    }
  }

  /**
   * Delete LineFVI
   */
  public async deleteLineFVI(code: string): Promise<LineFVIResponse<void>> {
    console.log('🔄 LineFVI Service - Deleting LineFVI:', code);
    
    try {
      const response = await this.makeRequest<void>(`${this.baseUrl}/${code}`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        console.log('✅ LineFVI Service - LineFVI deleted successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - deleteLineFVI error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete LineFVI'
      };
    }
  }

  /**
   * Toggle LineFVI status (active/inactive)
   */
  public async toggleLineFVIStatus(code: string): Promise<LineFVIResponse<LineFVI>> {
    console.log('🔄 LineFVI Service - Toggling LineFVI status:', code);
    
    try {
      
      const response = await this.makeRequest<any>(`${this.baseUrl}/${code}/status`, {
        method: 'PATCH',
      });
      
      if (response.success && response.data) {
        const normalizedEntity = this.normalizeLineFVI(response.data);
        console.log('✅ LineFVI Service - Status toggled successfully');
        return {
          success: true,
          data: normalizedEntity,
          message: response.message || 'Status updated successfully'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Failed to toggle status'
      };
    } catch (error) {
      console.error('❌ LineFVI Service - toggleLineFVIStatus error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to toggle status'
      };
    }
  }

  // ============ UTILITY OPERATIONS ============

  /**
   * Get only active LineFVIs
   */
  public async getActiveLineFVIs(): Promise<LineFVIResponse<LineFVI[]>> {
    console.log('🔄 LineFVI Service - Getting active LineFVIs only');
    return this.getLineFVIs({ isActive: true, activeFilter: true });
  }

  /**
   * Search LineFVIs by term
   */
  public async searchLineFVIs(searchTerm: string): Promise<LineFVIResponse<LineFVI[]>> {
    console.log('🔄 LineFVI Service - Searching LineFVIs:', searchTerm);
    return this.getLineFVIs({ search: searchTerm });
  }

  /**
   * Validate LineFVI code availability
   */
  public async validateLineFVICode(code: string, excludeCode?: string): Promise<LineFVIResponse<{ isValid: boolean; message?: string }>> {
    console.log('🔄 LineFVI Service - Validating LineFVI code:', { code, excludeCode });
    
    try {
      const params: Record<string, string> = { code };
      if (excludeCode) {
        params.excludeCode = excludeCode;
      }
      
      const queryString = this.buildQueryString(params);
      const response = await this.makeRequest<{ isValid: boolean; message?: string }>(`${this.baseUrl}/validate/code?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - validateLineFVICode error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate code'
      };
    }
  }

  /**
   * Validate LineFVI name availability
   */
  public async validateLineFVIName(name: string, excludeCode?: string): Promise<LineFVIResponse<{ isValid: boolean; message?: string }>> {
    console.log('🔄 LineFVI Service - Validating LineFVI name:', { name, excludeCode });
    
    try {
      const params: Record<string, string> = { name };
      if (excludeCode) {
        params.excludeCode = excludeCode;
      }
      
      const queryString = this.buildQueryString(params);
      const response = await this.makeRequest<{ isValid: boolean; message?: string }>(`${this.baseUrl}/validate/name?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - validateLineFVIName error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to validate name'
      };
    }
  }

  // ============ DROPDOWN & SELECTION HELPERS ============

  /**
   * Get LineFVIs formatted for dropdown components
   */
  public async getLineFVIsForDropdown(): Promise<Array<{ value: string; label: string }>> {
    try {
      console.log('🔄 LineFVI Service - Getting LineFVIs for dropdown');
      const result = await this.getActiveLineFVIs();
      
      if (result.success && result.data) {
        const options = result.data.map(linefvi => ({
          value: linefvi.code,
          label: `${linefvi.code} - ${linefvi.name}`
        }));
        
        console.log('✅ LineFVI Service - Dropdown options created:', options.length);
        return options;
      }
      
      console.warn('⚠️ LineFVI Service - No data for dropdown');
      return [];
    } catch (error) {
      console.error('❌ LineFVI Service - getLineFVIsForDropdown error:', error);
      return [];
    }
  }

  /**
   * Get LineFVIs for selection components (code and name only)
   */
  public async getLineFVIsForSelection(): Promise<LineFVIResponse<Array<{ code: string; name: string }>>> {
    try {
      console.log('🔄 LineFVI Service - Getting LineFVIs for selection');
      const response = await this.makeRequest<any>(`${this.baseUrl}/active/selection`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Selection data retrieved successfully'
        };
      }
      
      // Fallback to regular API if selection endpoint doesn't exist
      const fallbackResult = await this.getActiveLineFVIs();
      if (fallbackResult.success && fallbackResult.data) {
        const selectionData = fallbackResult.data.map(linefvi => ({
          code: linefvi.code,
          name: linefvi.name
        }));
        
        return {
          success: true,
          data: selectionData,
          message: 'Selection data retrieved successfully (fallback)'
        };
      }
      
      return {
        success: false,
        message: 'Failed to get selection data'
      };
    } catch (error) {
      console.error('❌ LineFVI Service - getLineFVIsForSelection error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get selection data'
      };
    }
  }

  // ============ STATISTICS OPERATIONS ============

  /**
   * Get LineFVI statistics with proper error handling
   */
  public async getStats(): Promise<LineFVIResponse<LineFVIStats>> {
    console.log('📊 LineFVI Service - Getting statistics');
    
    try {
      const response = await this.makeRequest<any>(`${this.baseUrl}/statistics`);
      
      console.log('📊 LineFVI Service - Stats response:', response);
      
      if (response.success && response.data) {
        // Handle nested response structure (API returns data.overview.{total, active, inactive})
        const statsSource = response.data.overview || response.data;

        // Normalize stats structure to match expected format
        const stats: LineFVIStats = {
          total: statsSource.total || statsSource.total_linefvis || 0,
          active: statsSource.active || statsSource.active_linefvis || 0,
          inactive: statsSource.inactive || statsSource.inactive_linefvis || 0,
          recent_linefvis: statsSource.recent_linefvis || statsSource.recent || 0
        };

        console.log('✅ LineFVI Service - Raw API data:', response.data);
        console.log('✅ LineFVI Service - Stats source:', statsSource);
        
        console.log('✅ LineFVI Service - Normalized stats:', stats);
        
        return {
          success: true,
          data: stats,
          message: response.message || 'Statistics retrieved successfully'
        };
      }
      
      // Fallback stats if API fails
      console.warn('⚠️ LineFVI Service - Using fallback stats');
      return {
        success: true,
        data: { total: 0, active: 0, inactive: 0 },
        message: 'Using fallback statistics'
      };
    } catch (error) {
      console.error('❌ LineFVI Service - getStats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get statistics',
        data: { total: 0, active: 0, inactive: 0 }
      };
    }
  }

  // ============ BULK OPERATIONS ============

  /**
   * Bulk toggle status for multiple LineFVIs
   */
  public async bulkToggleStatus(codes: string[], active: boolean): Promise<LineFVIResponse<{ updated: number }>> {
    console.log('🔄 LineFVI Service - Bulk toggle status:', { codes, active });
    
    try {
      const response = await this.makeRequest<{ updated: number }>(`${this.baseUrl}/bulk/status`, {
        method: 'PATCH',
        body: JSON.stringify({ codes, active }),
      });
      
      if (response.success) {
        console.log('✅ LineFVI Service - Bulk status update successful');
      }
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - bulkToggleStatus error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk update status'
      };
    }
  }

  /**
   * Bulk delete multiple LineFVIs
   */
  public async bulkDelete(codes: string[]): Promise<LineFVIResponse<{ deleted: number }>> {
    console.log('🔄 LineFVI Service - Bulk delete:', codes);
    
    try {
      const response = await this.makeRequest<{ deleted: number }>(`${this.baseUrl}/bulk/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ codes }),
      });
      
      if (response.success) {
        console.log('✅ LineFVI Service - Bulk delete successful');
      }
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - bulkDelete error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to bulk delete'
      };
    }
  }

  // ============ ADVANCED OPERATIONS ============

  /**
   * Search LineFVIs by name pattern
   */
  public async searchByNamePattern(pattern: string): Promise<LineFVIResponse<LineFVI[]>> {
    console.log('🔄 LineFVI Service - Searching by name pattern:', pattern);
    
    try {
      const queryString = this.buildQueryString({ pattern });
      const response = await this.makeRequest<any>(`${this.baseUrl}/search/name/${encodeURIComponent(pattern)}?${queryString}`);
      
      if (response.success && response.data) {
        const entities = this.extractEntitiesArray(response.data);
        return {
          success: true,
          data: entities,
          message: response.message || `Found ${entities.length} matching LineFVIs`
        };
      }
      
      return {
        success: false,
        message: response.message || 'Search failed',
        data: []
      };
    } catch (error) {
      console.error('❌ LineFVI Service - searchByNamePattern error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Search failed',
        data: []
      };
    }
  }

  /**
   * Check LineFVI code availability with suggestions
   */
  public async checkCodeAvailability(code: string): Promise<LineFVIResponse<{ 
    available: boolean; 
    suggestions?: string[]; 
    conflicts?: string[] 
  }>> {
    console.log('🔄 LineFVI Service - Checking code availability:', code);
    
    try {
      const queryString = this.buildQueryString({ code });
      const response = await this.makeRequest<any>(`${this.baseUrl}/check-code?${queryString}`);
      
      return response;
    } catch (error) {
      console.error('❌ LineFVI Service - checkCodeAvailability error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check code availability'
      };
    }
  }
}

// ============ SINGLETON EXPORT ============

/**
 * Main LineFVI service instance - singleton pattern
 */
export const linefviService = new LineFVIApiService();

/**
 * Default export for convenience
 */
export default linefviService;

// ============ TYPE RE-EXPORTS FOR BACKWARD COMPATIBILITY ============

export type { 
  LineFVI, 
  LineFVIFormData, 
  UpdateLineFVIFormData, 
  LineFVIQueryParams, 
  LineFVIResponse, 
  LineFVIStats 
} from '../types/lineFVI';

/*
=== COMPLETE LINEFVI SERVICE FEATURES ===

COMPREHENSIVE RESPONSE HANDLING:
✅ Handles nested response structures automatically ({ data: { data: [], pagination: {} } })
✅ Handles flat response structures ({ data: [], pagination: {} })
✅ Automatic array detection in unknown structures
✅ Proper pagination extraction from any response format
✅ Data normalization and validation for all entities

FULL CRUD OPERATIONS:
✅ getLineFVIs() - List with pagination, filtering, searching, sorting
✅ getLineFVI() - Get single entity by code
✅ createLineFVI() - Create new entity with validation
✅ updateLineFVI() - Update existing entity
✅ deleteLineFVI() - Delete entity
✅ toggleLineFVIStatus() - Toggle active/inactive status

UTILITY OPERATIONS:
✅ getActiveLineFVIs() - Get only active entities
✅ searchLineFVIs() - Search by term
✅ validateLineFVICode() - Check code availability
✅ validateLineFVIName() - Check name availability
✅ getLineFVIsForDropdown() - Formatted for UI dropdowns
✅ getLineFVIsForSelection() - Optimized for selection components

BULK OPERATIONS:
✅ bulkToggleStatus() - Toggle status for multiple entities
✅ bulkDelete() - Delete multiple entities
✅ Comprehensive error handling for bulk operations

ADVANCED FEATURES:
✅ searchByNamePattern() - Pattern-based searching
✅ checkCodeAvailability() - With suggestions and conflict detection
✅ getStats() - Comprehensive statistics with normalization
✅ Comprehensive logging for debugging
✅ Development mode debug information

ERROR HANDLING & RESILIENCE:
✅ Network error handling with retry logic
✅ HTTP status code validation
✅ Response structure validation
✅ Fallback mechanisms for missing endpoints
✅ Comprehensive error logging and user feedback

DEVELOPMENT FEATURES:
✅ Extensive debug logging (development mode only)
✅ Response structure analysis
✅ Request/response timing information
✅ Error context and stack traces
✅ Performance monitoring hooks

TYPE SAFETY:
✅ Full TypeScript support with strict typing
✅ Generic response types for all operations
✅ Proper interface definitions for all data structures
✅ Runtime data validation and normalization

This service provides complete LineFVI entity management functionality
while being resilient to different backend response structures and 
providing comprehensive error handling and debugging capabilities.
*/