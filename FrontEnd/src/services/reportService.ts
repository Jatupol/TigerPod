// client/src/services/reportService.ts
// ===== REPORT SERVICE =====
// Line Acceptance Rate (LAR) Report Client Service
// Manufacturing Quality Control System - Frontend API Service

import api from './api';

// ==================== INTERFACES ====================
/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// ==================== LAR REPORT SERVICE ====================
/**
 * LAR Report Data Record Interface
 */
export interface LARReportRecord {
  ww: string;
  total_lot: number;
  total_pass_lot: number;
  total_fail_lot: number;
  total_inspection: number;
  defectname: string | null;
  total_ng: number;
  lar: number;
  dppm: number;
}

/**
 * Query parameters for LAR report Interface
 * Note: station='OQA' and round=1 are fixed on the server side
 */
export interface LARReportQueryParams {
  yearFrom?: string;
  wwFrom?: string;
  yearTo?: string;
  wwTo?: string;
  model?: string;
}
 
/**
 * Get LAR chart data (simplified format without defect breakdown)
 */
export const getLARChart = async (params: LARReportQueryParams = {}): Promise<ApiResponse<LARReportRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/lar-chart${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<LARReportRecord[]>(url);
    return response;
  } catch (error: any) {
    console.error('Error fetching LAR chart:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch LAR chart',
      errors: [error.message]
    };
  }
};

/**
 * Get LAR defect data (defects grouped by week)
 */
export const getLARDefect = async (params: LARReportQueryParams = {}): Promise<ApiResponse<LARReportRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/lar-defect${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<LARReportRecord[]>(url);
    return response;
  } catch (error: any) {
    console.error('Error fetching LAR defect data:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch LAR defect data',
      errors: [error.message]
    };
  }
};


// ==================== OQA DPPM Overall REPORT SERVICE ====================

/**
 *  OQA DPPM Overall Report Data Record
 */
export interface OQADPPMOverallRecord {
  yearmonth: string;
  total_lot: number;
  total_pass_lot: number;
  total_fail_lot: number;
  total_inspection: number;
  defectname: string | null;
  dppmTarget: number;
  ng_qty: number;
  lar: number;
  dppm: number;
}

/**
 * Query parameters for LAR report
 * Note: station='OQA' and round=1 are fixed on the server side
 */
export interface OQADPPMOverallQueryParams {
  year?: string;
  ww?: string;

}


/**
 * Get OQA DPPM Overall chart data
 */
export const getOQADPPMOverallChart = async (params: OQADPPMOverallQueryParams = {}): Promise<ApiResponse<OQADPPMOverallRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();  

    const url = `/report/oqa-dppm-overall-chart${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<OQADPPMOverallRecord[]>(url);
    console.log('📊 OQA DPPM Overall chart response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching OQA DPPM Overall chart:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch OQA DPPM Overall chart',
      errors: [error.message]
    };
  }
};

/**
 * Get OQA DPPM Overall defect data
 */
export const getOQADPPMOverallDefect = async (params: OQADPPMOverallQueryParams = {}): Promise<ApiResponse<OQADPPMOverallRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/oqa-dppm-overall-defect${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<OQADPPMOverallRecord[]>(url);
    console.log('📊 OQA DPPM Overall defect response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching OQA DPPM Overall defect data:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch OQA DPPM Overall defect data',
      errors: [error.message]
    };
  }
};


// ==================== SGT IQA TREND REPORT SERVICE ====================


/**
 * SGT IQA Trend Report Data Record
 */
export interface SGTIQATrendRecord {
  yearmonth: string;
  model: string;
  product_type: string;
  total_lot: number;
  total_pass_lot: number;
  total_fail_lot: number;
  total_inspection: number;
  total_ng: number;
  lar: number;
  dppm: number;
  defect?: string;
  rej?: number;
}

/**
 * Query parameters for SGT IQA Trend report
 */
export interface SGTIQATrendQueryParams {
  year?: string;
  ww?: string;
  model?: string;
  product_type?: string;
}

/**
 * Get SGT IQA Trend chart data
 */
export const getSGTIQATrendChart = async (params: SGTIQATrendQueryParams = {}): Promise<ApiResponse<SGTIQATrendRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/sgt-iqa-trend-chart${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<SGTIQATrendRecord[]>(url);
    console.log('📊 SGT IQA Trend chart response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching SGT IQA Trend chart:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch SGT IQA Trend chart',
      errors: [error.message]
    };
  }
};

/**
 * Get SGT IQA Trend defect data
 */
export const getSGTIQATrendDefect = async (params: SGTIQATrendQueryParams = {}): Promise<ApiResponse<SGTIQATrendRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/sgt-iqa-trend-defect${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<SGTIQATrendRecord[]>(url);
    console.log('📊 SGT IQA Trend defect response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching SGT IQA Trend defect data:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch SGT IQA Trend defect data',
      errors: [error.message]
    };
  }
};

// ==================== SEAGATE IQA RESULT REPORT SERVICE ====================

/**
 * Seagate IQA Result Report Data Record
 */
export interface SeagateIQAResultRecord {
  model: string;
  fy: string;
  ww: string;
  fyww: string;
  total_inspection_lot: number;
  acceptable_lot: number;
  rejected_lot: number;
  rejected_qty: number;
  lar: number | string;
}

/**
 * Query parameters for Seagate IQA Result report
 */
export interface SeagateIQAResultQueryParams {
  year: string;
  ww: string;
}

/**
 * Get Seagate IQA Result report data
 */
export const getSeagateIQAResult = async (params: SeagateIQAResultQueryParams): Promise<ApiResponse<SeagateIQAResultRecord[]>> => {
  try {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = `/report/seagate-iqa-result${queryString ? `?${queryString}` : ''}`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<SeagateIQAResultRecord[]>(url);
    console.log('📊 Seagate IQA Result response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching Seagate IQA Result:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch Seagate IQA Result',
      errors: [error.message]
    };
  }
};

// ======================== UTILITY ========================
/**
 * Get available models for filtering
 */
export const getAvailableModels = async (): Promise<ApiResponse<string[]>> => {
  try {
    console.log('📡 Calling api.get("/report/models")...');
    const response = await api.get<string[]>('/report/models');
    console.log('📊 Raw API response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching available models:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch available models',
      errors: [error.message || 'Unknown error']
    };
  }
};

/**
 * Get available fiscal years for filtering
 */
export const getFiscalYears = async (): Promise<ApiResponse<string[]>> => {
  try {
    console.log('📡 Calling api.get("/report/fiscal-years")...');
    const response = await api.get<string[]>('/report/fiscal-years');
    console.log('📊 Fiscal years response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching fiscal years:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch fiscal years',
      errors: [error.message || 'Unknown error']
    };
  }
};

/**
 * Get available work weeks for filtering (optionally filtered by fiscal year)
 * @param fiscalYear - Optional fiscal year to filter work weeks
 */
export const getWorkWeeks = async (fiscalYear?: string): Promise<ApiResponse<string[]>> => {
  try {
    const url = fiscalYear
      ? `/report/work-weeks?fy=${fiscalYear}`
      : `/report/work-weeks`;
    console.log('📡 Calling api.get("' + url + '")...');
    const response = await api.get<string[]>(url);
    console.log('📊 Work weeks response:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Error fetching work weeks:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch work weeks',
      errors: [error.message || 'Unknown error']
    };
  }
};

// ==================== EXPORTS ====================

export default {
  getLARChart,
  getLARDefect,
  getOQADPPMOverallChart,
  getOQADPPMOverallDefect,
  getSGTIQATrendChart,
  getSGTIQATrendDefect,
  getSeagateIQAResult,
  getAvailableModels,
  getFiscalYears,
  getWorkWeeks
};

/*
=== LAR REPORT SERVICE FEATURES ===

CLIENT-SIDE API SERVICE:
✅ Axios-based API calls using centralized api instance
✅ Type-safe interfaces matching server-side types
✅ Query parameter building and URL encoding
✅ Comprehensive error handling

CORE OPERATIONS:
✅ getLARReport() - Fetch raw report data
✅ getLARWeeklyReport() - Fetch aggregated weekly data
✅ getLARStats() - Fetch statistical summary
✅ checkLARReportHealth() - Service health check

QUERY PARAMETERS:
✅ Work week range filtering (wwFrom, wwTo)
✅ Model filtering (model)
✅ Station fixed to 'OQA' on server (not configurable)
✅ Round fixed to 1 on server (not configurable)

ERROR HANDLING:
✅ Try-catch blocks for all operations
✅ Console logging for debugging
✅ User-friendly error messages
✅ Axios error response handling

TYPE SAFETY:
✅ TypeScript interfaces for all data types
✅ Generic ApiResponse wrapper
✅ Proper type annotations
✅ Null safety for optional fields
*/
