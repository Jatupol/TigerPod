// client/src/types/lineFVI.ts
// LineFVI Types - Compatible with GenericEntityCodePage EntityData interface

// ============ BASE ENTITYDATA COMPATIBLE INTERFACE ============

/**
 * LineFVI interface compatible with GenericEntityCodePage EntityData constraint
 * Ensures proper type compatibility for generic components
 */
export interface LineFVI {
  code: string;
  name: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;        // Must be Date object for EntityData compatibility
  updated_at: Date;        // Must be Date object for EntityData compatibility
}

/**
 * Raw LineFVI data as received from API (before normalization)
 * Used internally by service for parsing API responses
 */
export interface RawLineFVIData {
  code: string;
  name: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: string | Date;  // API might return string
  updated_at: string | Date;  // API might return string
}

// ============ FORM DATA INTERFACES ============

export interface LineFVIFormData {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateLineFVIFormData {
  name?: string;
  is_active?: boolean;
}

// ============ QUERY AND RESPONSE INTERFACES ============

export interface LineFVIQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof LineFVI;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
  isActive?: boolean;
  activeFilter?: boolean;
}

export interface LineFVIResponse<T = any> {
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

export interface LineFVIStats {
  total: number;
  active: number;
  inactive: number;
  recent_linefvis?: number;
}

// ============ UTILITY FUNCTIONS ============

/**
 * Normalize raw API data to proper LineFVI format
 * Ensures Date objects and proper type compatibility
 */
export function normalizeLineFVIData(rawData: RawLineFVIData): LineFVI {
  return {
    code: rawData.code || '',
    name: rawData.name || '',
    is_active: rawData.is_active !== undefined ? rawData.is_active : true,
    created_by: rawData.created_by || 0,
    updated_by: rawData.updated_by || 0,
    created_at: typeof rawData.created_at === 'string' 
      ? new Date(rawData.created_at) 
      : rawData.created_at || new Date(),
    updated_at: typeof rawData.updated_at === 'string' 
      ? new Date(rawData.updated_at) 
      : rawData.updated_at || new Date()
  };
}

/**
 * Type guard to check if data is valid LineFVI
 */
export function isValidLineFVI(data: any): data is LineFVI {
  return data &&
    typeof data.code === 'string' &&
    typeof data.name === 'string' &&
    typeof data.is_active === 'boolean' &&
    data.created_at instanceof Date &&
    data.updated_at instanceof Date;
}

// ============ EXPORTS ============

// Re-export for convenience
export type { LineFVI as default };

 