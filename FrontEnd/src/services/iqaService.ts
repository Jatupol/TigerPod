// client/src/services/iqaService.ts

/**
 * IQA Service - Frontend API service for IQA entity
 *
 * Provides centralized service for IQA data import, management, and operations
 * Includes Excel file processing, validation, and API communication
 */

import * as XLSX from 'xlsx';
import { apiBaseUrl } from '../config/api.config';
import type {
  IQAData,
  IQACreateRequest,
  IQABulkImportRequest,
  IQABulkImportResponse,
  IQAQueryFilters,
  IQAQueryOptions,
  IQAExportData,
  IQAHeaderValidationResult,
  IQA_EXPECTED_HEADERS,
  IQADefectSubmission
} from '../types/iqa';
import { IQA_EXPECTED_HEADERS as EXPECTED_HEADERS } from '../types/iqa';

// ==================== RESPONSE TYPES ====================

export interface IQAApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ==================== EXCEL PROCESSING UTILITIES ====================

/**
 * Helper function to convert Excel serial date to text string
 */
export const formatDateAsText = (value: any): string | null => {
  if (!value) return null;

  try {
    // If it's already a string, return as-is
    if (typeof value === 'string') {
      return value.trim() || null;
    }

    // If it's a number (Excel serial date)
    if (typeof value === 'number') {
      // Excel stores dates as days since 1900-01-01
      // Convert Excel serial date to JavaScript date
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch (Dec 30, 1899)
      const jsDate = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

      // Check if date is valid
      if (isNaN(jsDate.getTime())) {
        return null;
      }

      // Return formatted date string (YYYY-MM-DD)
      return jsDate.toISOString().split('T')[0];
    }

    // Try to parse as date object
    const date = new Date(value);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    // Return formatted date string (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch (error) {
    return null;
  }
};

/**
 * Helper function to safely parse integer
 */
export const parseInteger = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Validate Excel file headers match expected template
 */
export const validateHeaders = (actualHeaders: string[]): IQAHeaderValidationResult => {
  const errors: string[] = [];
  const mismatches: Array<{ column: number; expected: string; actual: string }> = [];

  // Check if the number of headers match
  if (actualHeaders.length !== EXPECTED_HEADERS.length) {
    errors.push(
      `Expected ${EXPECTED_HEADERS.length} columns but found ${actualHeaders.length}`
    );
  }

  // Check if each header matches (case-sensitive)
  for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
    if (actualHeaders[i] !== EXPECTED_HEADERS[i]) {
      mismatches.push({
        column: i + 1,
        expected: EXPECTED_HEADERS[i],
        actual: actualHeaders[i] || '(missing)'
      });
      errors.push(
        `Column ${i + 1}: Expected "${EXPECTED_HEADERS[i]}" but found "${actualHeaders[i] || '(missing)'}"`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    expectedCount: EXPECTED_HEADERS.length,
    actualCount: actualHeaders.length,
    mismatches
  };
};

/**
 * Parse Excel file and map to IQA data structure
 */
export const parseExcelFile = async (file: File): Promise<IQACreateRequest[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Read the data
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  if (jsonData.length === 0) {
    throw new Error('The uploaded Excel file is empty. Please use the IQA_Template.xlsx file and add data rows.');
  }

  // Validate headers
  const firstRow = jsonData[0] as any;
  const actualHeaders = Object.keys(firstRow);
  const validation = validateHeaders(actualHeaders);

  if (!validation.isValid) {
    throw new Error(
      `Invalid file format. Header columns do not match:\n${validation.errors.join('\n')}\n\nPlease use the IQA_Template.xlsx file.`
    );
  }

  // Map Excel columns to database fields
  const mappedData = jsonData
    .map((row: any) => {
      const keys = Object.keys(row);
      return {
        // fy and ww are auto-calculated from date_iqa on backend
        fw: row[keys[0]] || null,
        date_iqa: formatDateAsText(row[keys[1]]),
        shift_to_shift: row[keys[2]] || null,
        expense: row[keys[3]] || null,
        re_expense: row[keys[4]] || null,
        qc_owner: row[keys[5]] || null,
        model: row[keys[6]] || null,
        item: row[keys[7]] || null,
        telex: row[keys[8]] || null,
        supplier: row[keys[9]] || null,
        descr: row[keys[10]] || null,
        location: null, // LOCATIONS column removed from template
        qty: parseInteger(row[keys[11]]),
        supplier_do: row[keys[12]] || null,
        remark: row[keys[13]] || null,
        po: row[keys[14]] || null,
        sbr: row[keys[15]] || null,
        disposition_code: row[keys[16]] || null,
        receipt_date: formatDateAsText(row[keys[17]]),
        age: parseInteger(row[keys[18]]),
        warehouse: row[keys[19]] || null,
        building: row[keys[20]] || null,
        business_unit: row[keys[21]] || null,
        std_case_qty: parseInteger(row[keys[22]]),
        lpn: parseInteger(row[keys[23]]),
        ref_code: row[keys[24]] || null,
        lotno: row[keys[25]] || null,
        data_on_web: row[keys[26]] || null,
        inspec: parseInteger(row[keys[27]]),
        rej: parseInteger(row[keys[28]]),
        defect: row[keys[29]] || null,
        vender: row[keys[30]] || null
      };
    })
    .filter((record) => {
      // Filter out records with blank/null required fields
      const hasLotNo = record.lotno !== null && record.lotno !== '';
      return hasLotNo;
    });

  return mappedData;
};

/**
 * Prepare data for Excel export
 */
export const prepareExportData = (records: IQAData[]): IQAExportData[] => {
  return records.map((record, index) => ({
    '#': index + 1,
    'FY': record.fy || '',
    'WW': record.ww || '',
    'FW': record.fw || '',
    'Date IQA': record.date_iqa || '',
    'Shift to Shift': record.shift_to_shift || '',
    'Expense': record.expense || '',
    'Re-Expense': record.re_expense || '',
    'QC Owner': record.qc_owner || '',
    'MODEL': record.model || '',
    'ITEM': record.item || '',
    'TELEX': record.telex || '',
    'SUPPLIER': record.supplier || '',
    'DESCR': record.descr || '',
    'LOCATION': record.location || '',
    'QTY': record.qty || 0,
    'SUPPLIER DO': record.supplier_do || '',
    'REMARK': record.remark || '',
    'PO': record.po || '',
    'SBR': record.sbr || '',
    'DISPOSITION CODE': record.disposition_code || '',
    'RECEIPT DATE': record.receipt_date || '',
    'AGE': record.age || 0,
    'Warehouse': record.warehouse || '',
    'Building': record.building || '',
    'Business Unit': record.business_unit || '',
    'Std Case Qty': record.std_case_qty || 0,
    'LPN': record.lpn || 0,
    'Ref Code': record.ref_code || '',
    'Lot No': record.lotno || '',
    'Data on Web': record.data_on_web || '',
    'Inspec': record.inspec || 0,
    'Rej': record.rej || 0,
    'Defect': record.defect || '',
    'Vender': record.vender || ''
  }));
};

/**
 * Export data to Excel file
 */
export const exportToExcel = (records: IQAData[], filename: string = 'IQA_Export'): void => {
  const exportData = prepareExportData(records);
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'IQA Data');

  // Generate timestamp for unique filename
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);
};

// ==================== IQA SERVICE CLASS ====================

class IQAApiService {
  private readonly baseUrl = apiBaseUrl('iqadata');
  private readonly defectBaseUrl = apiBaseUrl('defectdata-iqa');

  // ============ HELPER METHODS ============

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<IQAApiResponse<T>> {
    try {
      console.log(`📡 IQA Service - Making request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`📡 IQA Service - Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status} ${response.statusText}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('📡 IQA Service - Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ IQA Service - Network error:', error);
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
    });
    return searchParams.toString();
  }

  // ============ CRUD OPERATIONS ============

  public async getAll(filters?: IQAQueryFilters, options?: IQAQueryOptions): Promise<IQAApiResponse<IQAData[]>> {
    const params = { ...filters, ...options };
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return this.makeRequest<IQAData[]>(url);
  }

  public async getById(id: number): Promise<IQAApiResponse<IQAData>> {
    return this.makeRequest<IQAData>(`${this.baseUrl}/${id}`);
  }

  public async create(data: IQACreateRequest): Promise<IQAApiResponse<IQAData>> {
    return this.makeRequest<IQAData>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async bulkImport(records: IQACreateRequest[]): Promise<IQAApiResponse<IQABulkImportResponse>> {
    return this.makeRequest<IQABulkImportResponse>(`${this.baseUrl}/bulk-import`, {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  }

  public async delete(id: number): Promise<IQAApiResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  public async bulkDelete(ids: number[]): Promise<IQAApiResponse<any>> {
    return this.makeRequest(`${this.baseUrl}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // ============ FILTER OPERATIONS ============

  public async getFilterOptions(): Promise<IQAApiResponse<{ fyOptions: string[]; wwOptions: string[] }>> {
    return this.makeRequest<{ fyOptions: string[]; wwOptions: string[] }>(`${this.baseUrl}/filter-options`);
  }

  /**
   * Get distinct FY (Fiscal Year) values for filtering
   */
  public async getDistinctFY(): Promise<IQAApiResponse<string[]>> {
    try {
      console.log('📡 IQA Service - Fetching distinct FY values...');
      const response = await fetch(`${this.baseUrl}/distinct-fy`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('📡 IQA Service - FY Options loaded:', result);

      return {
        success: result.success || true,
        data: result.data || []
      };
    } catch (error) {
      console.error('❌ IQA Service - Error loading FY options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  /**
   * Get distinct WW (Work Week) values for filtering
   * @param fy - Optional FY filter to get WW values for a specific fiscal year
   */
  public async getDistinctWW(fy?: string): Promise<IQAApiResponse<string[]>> {
    try {
      console.log('📡 IQA Service - Fetching distinct WW values...');
      const url = fy
        ? `${this.baseUrl}/distinct-ww?fy=${encodeURIComponent(fy)}`
        : `${this.baseUrl}/distinct-ww`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`❌ IQA Service - HTTP Error: ${response.status}`);
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('📡 IQA Service - WW Options loaded:', result);

      return {
        success: result.success || true,
        data: result.data || []
      };
    } catch (error) {
      console.error('❌ IQA Service - Error loading WW options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  // ============ DEFECT SUBMISSION ============

  public async submitDefect(submission: IQADefectSubmission): Promise<IQAApiResponse<any>> {
    const formData = new FormData();
    formData.append('iqa_id', String(submission.iqa_id));
    formData.append('defect_id', String(submission.defect_id));
    formData.append('defect_description', submission.defect_description);

    if (submission.images) {
      submission.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/defect`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ IQA Service - Defect submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  public async getDefectsByIQAId(iqaId: number): Promise<IQAApiResponse<any[]>> {
    return this.makeRequest<any[]>(`${this.baseUrl}/${iqaId}/defects`);
  }

  /**
   * Get saved defect data for a specific IQA record
   * @param iqaId - IQA record ID
   */
  public async getSavedDefectData(iqaId: number): Promise<IQAApiResponse<any[]>> {
    try {
      console.log('📡 IQA Service - Loading saved defect data for IQA ID:', iqaId);

      const response = await fetch(`${this.defectBaseUrl}/iqa/${iqaId}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log('📡 IQA Service - Loaded saved defect data:', result.data);
        return {
          success: true,
          data: result.data
        };
      } else {
        console.error('❌ IQA Service - Failed to load saved defect data:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to load saved defect data',
          data: []
        };
      }
    } catch (error) {
      console.error('❌ IQA Service - Error loading saved defect data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        data: []
      };
    }
  }

  /**
   * Submit bulk defect data with images
   * @param defectId - Defect type ID
   * @param description - Defect description
   * @param iqaId - IQA record ID
   * @param images - Array of image files
   */
  public async submitBulkDefect(
    defectId: number,
    description: string,
    iqaId: number,
    images: File[]
  ): Promise<IQAApiResponse<any>> {
    try {
      console.log('📡 IQA Service - Submitting bulk defect data...');

      const formData = new FormData();
      formData.append('defect_id', defectId.toString());
      formData.append('defect_description', description);
      formData.append('iqaid', iqaId.toString());

      images.forEach((file) => {
        formData.append('images', file);
      });

      console.log('📡 IQA Service - Defect submission data:', {
        defect_id: defectId,
        defect_description: description,
        iqaid: iqaId,
        image_count: images.length
      });

      const response = await fetch(`${this.defectBaseUrl}/bulk`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('📡 IQA Service - Response status:', response.status);

      const result = await response.json();

      if (result.success) {
        console.log('✅ IQA Service - Defect data submitted successfully');
        return {
          success: true,
          message: result.message || 'Defect data submitted successfully',
          data: result.data
        };
      } else {
        console.error('❌ IQA Service - Defect submission failed:', result.message);
        return {
          success: false,
          message: result.message || 'Failed to submit defect data'
        };
      }
    } catch (error) {
      console.error('❌ IQA Service - Error submitting defect data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }
}

// ============ SINGLETON EXPORT ============

export const iqaService = new IQAApiService();
export default iqaService;
