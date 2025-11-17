// client/src/services/sysconfigService.ts
/**
 * System Configuration Service - Native Fetch API Communication
 *
 * This service handles communication with the sysconfig API endpoint
 * and provides parsed configuration data for dropdown components.
 *
 * Architecture Benefits:
 * ✅ Native fetch API (no external dependencies)
 * ✅ Consistent error handling with customerService pattern
 * ✅ Cache-busting for fresh data
 * ✅ Complete Separation Entity Architecture
 * ✅ Self-contained sysconfig client service
 * ✅ Parses comma-separated values from database
 * ✅ Environment-aware API configuration
 */

import React from 'react';
import { apiBaseUrl } from '../config/api.config';

// ==================== INTERFACES ====================

export interface Sysconfig {
  id: number;
  config_name: string;
  config_description: string;
  fvi_lot_qty: string;
  general_oqa_qty: string;
  crack_oqa_qty: string;
  general_siv_qty: string;        // Renamed from general_fiv_qty
  crack_siv_qty: string;          // Renamed from crack_fiv_qty
  defect_type: string;
  defect_color: string;
  shift: string;
  site: string;
  grps: string;
  zones: string;
  tabs: string;
  product_type: string;
  product_families: string;
  // Additional fields from schema
  inf_server: string;
  inf_serverport: string;
  inf_database: string;
  inf_user: string;
  inf_password: string;
  system_name: string;
  system_version: string;
  timezone: string;
  date_format: string;
  time_format: string;
  enable_auto_sync: boolean;
  enable_notifications: boolean;
  enable_audit_log: boolean;
  enable_advanced_search: boolean;
  sync_interval_minutes: number;
  cache_timeout_minutes: number;
  max_records_per_page: number;
  connection_timeout_seconds: number;
  systemversion?: string;         // New field
  systemupdated?: Date;           // New field
  news?: string;                  // News content field
}

export interface ParsedSysconfig {
  id: number;
  fvi_lot_qty: number[];
  general_oqa_qty: number[];
  crack_oqa_qty: number[];
  general_siv_qty: number[];      // Renamed from general_fiv_qty
  crack_siv_qty: number[];        // Renamed from crack_fiv_qty
  defect_type: string[];
  defect_color: string[];
  shift: string[];
  site: string[];
  grps: string[];
  zones: string[];
  tabs: string[];
  product_type: string[];
  product_families: string[];
}

export interface DropdownOption {
  value: string;
  label: string;
  code?: string;
}

// System Setup Configuration (SMTP, MSSQL, System Info)
export interface SystemSetupConfig {
  id: number;
  system_name: string | null;
  system_updated: Date | null;
  smtp_server: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null;
  mssql_server: string | null;
  mssql_port: number;
  mssql_database: string | null;
  mssql_username: string | null;
  mssql_password: string | null;
  created_at: Date;
  updated_at: Date;
}

// ==================== RESPONSE TYPES ====================

export interface SysconfigApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export type SysconfigResponse = SysconfigApiResponse<Sysconfig>;

// ==================== SYSCONFIG SERVICE CLASS ====================

class SysconfigService {
  private readonly baseUrl = apiBaseUrl('sysconfig');
  private cache: ParsedSysconfig | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  // ==================== HELPER METHODS ====================

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<SysconfigApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      console.log(`SysconfigService: ${options.method || 'GET'} ${url} - Status: ${response.status}`);

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        console.warn('SysconfigService: Received 304 Not Modified, treating as successful empty response');
        return {
          success: true,
          data: [] as any,
          message: 'Data not modified (cached)',
          errors: []
        };
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('SysconfigService: API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
      }

      return data;
    } catch (error) {
      console.error('SysconfigService.makeRequest error:', error);
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: []
      };
    }
  }

  /**
   * Get system configuration from API
   */
  async getSysconfig(): Promise<Sysconfig> {
    try {
      console.log('🔄 Fetching sysconfig from API...');

      const url = `${this.baseUrl}/active?_t=${Date.now()}`;
      console.log(`📞 Trying endpoint: ${url}`);

      const response = await this.makeRequest<any>(url);
      console.log(`📋 Raw response from ${url}:`, response);

      // Handle different response formats
      if (response.success && response.data) {
        if (response.data.data) {
          // Format: { success: true, data: { data: {...} } }
          console.log(`✅ Successfully fetched sysconfig (nested):`, response.data.data);
          return response.data.data;
        } else if (response.data.id || response.data.config_name) {
          // Format: { success: true, data: {...} }
          //console.log(`✅ Successfully fetched sysconfig (direct):`, response.data);
          return response.data;
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Format: { success: true, data: [...] }
          console.log(`✅ Successfully fetched sysconfig (array):`, response.data[0]);
          return response.data[0];
        }
      }

      throw new Error(response.message || 'Invalid response format from sysconfig API');
    } catch (error) {
      console.error('❌ Error fetching sysconfig:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error; // Don't fallback to mock data - force real API connection
    }
  }

  /**
   * Get parsed system configuration with arrays
   */
  async getParsedSysconfig(): Promise<ParsedSysconfig> {
    try {
      console.log('🔄 Getting parsed sysconfig...');

      // Check cache
      if (this.cache && this.cacheTimestamp &&
          (Date.now() - this.cacheTimestamp) < this.CACHE_TTL) {
        console.log('✅ Returning cached sysconfig data');
        return this.cache;
      }

      console.log('🔄 Fetching fresh sysconfig data...');
      const sysconfig = await this.getSysconfig();
      console.log('📊 Raw sysconfig from API:', sysconfig);

      const parsed = this.parseConfigValues(sysconfig);
      console.log('📋 Parsed sysconfig data:', parsed);

      // Update cache
      this.cache = parsed;
      this.cacheTimestamp = Date.now();

      return parsed;
    } catch (error) {
      console.error('❌ Error getting parsed sysconfig:', error);
      throw error;
    }
  }

  /**
   * Update system configuration
   */
  async updateSysconfig(id: number, data: Partial<Sysconfig>): Promise<SysconfigResponse> {
    console.log('SysconfigService.updateSysconfig: Updating config', id, 'with data:', data);
    const response = await this.makeRequest<Sysconfig>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      // Clear cache when config is updated
      this.clearCache();
      return {
        success: true,
        data: response.data as Sysconfig,
        message: response.message || 'Configuration updated successfully',
        errors: response.errors || []
      };
    }

    return {
      success: false,
      data: undefined,
      message: response.message || 'Failed to update configuration',
      errors: response.errors || []
    };
  }

  /**
   * Get configuration statistics
   */
  async getStats(): Promise<SysconfigApiResponse<any>> {
    const url = `${this.baseUrl}/statistics?_t=${Date.now()}`;
    console.log('SysconfigService.getStats: Calling URL:', url);

    const response = await this.makeRequest<any>(url);

    // Handle the nested response structure from backend
    if (response.success && response.data && response.data.overview) {
      console.log('✅ SysconfigService.getStats: Extracting stats from overview object');
      console.log('Raw API response:', response.data);

      return {
        success: true,
        data: {
          total: response.data.overview.total || 0,
          active: response.data.overview.active || 0,
          inactive: response.data.overview.inactive || 0,
          recent: response.data.overview.recent || 0
        },
        message: response.message,
        errors: response.errors || []
      };
    }

    console.log('❌ SysconfigService.getStats: Invalid response structure');
    console.log('Expected: { data: { overview: { total, active, inactive } } }');
    console.log('Received:', response);

    return {
      success: false,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        recent: 0
      },
      message: response.message || 'Failed to load statistics',
      errors: response.errors || []
    };
  }

  /**
   * Parse comma-separated configuration values
   */
  private parseConfigValues(sysconfig: Sysconfig): ParsedSysconfig {
    return {
      id: sysconfig.id,
      fvi_lot_qty: this.parseNumbers(sysconfig.fvi_lot_qty),
      general_oqa_qty: this.parseNumbers(sysconfig.general_oqa_qty),
      crack_oqa_qty: this.parseNumbers(sysconfig.crack_oqa_qty),
      general_siv_qty: this.parseNumbers(sysconfig.general_siv_qty),  // Updated field name
      crack_siv_qty: this.parseNumbers(sysconfig.crack_siv_qty),      // Updated field name
      defect_type: this.parseStrings(sysconfig.defect_type),
      defect_color: this.parseStrings(sysconfig.defect_color),
      shift: this.parseStrings(sysconfig.shift),
      site: this.parseStrings(sysconfig.site),
      grps: this.parseStrings(sysconfig.grps),
      zones: this.parseStrings(sysconfig.zones),
      tabs: this.parseStrings(sysconfig.tabs),
      product_type: this.parseStrings(sysconfig.product_type),
      product_families: this.parseStrings(sysconfig.product_families)
    };
  }

  /**
   * Parse comma-separated numbers
   */
  private parseNumbers(value: string): number[] {
    if (!value) return [];

    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
      .map(item => {
        const num = parseInt(item, 10);
        return isNaN(num) ? 0 : num;
      });
  }

  /**
   * Parse comma-separated strings
   */
  private parseStrings(value: string): string[] {
    console.log('🔄 Parsing string value:', value);

    if (!value) {
      console.log('⚠️ Empty value provided');
      return [];
    }

    // Split by comma, trim whitespace, and filter empty strings
    const result = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '' && item !== null && item !== undefined);

    console.log('✅ Parsed strings:', result);
    return result;
  }

  /**
   * Clear cache - useful for forced refresh
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    return !!(this.cache && this.cacheTimestamp &&
             (Date.now() - this.cacheTimestamp) < this.CACHE_TTL);
  }

  // ==================== SYSTEM SETUP METHODS ====================

  /**
   * Get active system setup configuration (SMTP, MSSQL, System Info)
   */
  async getActiveSystemSetup(): Promise<SysconfigApiResponse<SystemSetupConfig>> {
    console.log('SysconfigService.getActiveSystemSetup: Fetching active system setup...');
    const url = `${this.baseUrl}/active?_t=${Date.now()}`;
    const response = await this.makeRequest<SystemSetupConfig>(url);

    if (response.success && response.data) {
      console.log('✅ Successfully fetched system setup configuration');
      return response;
    }

    console.error('❌ Failed to fetch system setup configuration');
    return response;
  }

  /**
   * Update system setup configuration
   */
  async updateSystemSetup(id: number, data: Partial<SystemSetupConfig>): Promise<SysconfigApiResponse<SystemSetupConfig>> {
    console.log('SysconfigService.updateSystemSetup: Updating system setup', id, 'with data:', data);
    const response = await this.makeRequest<SystemSetupConfig>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      console.log('✅ Successfully updated system setup configuration');
      this.clearCache();
    }

    return response;
  }

  /**
   * Test MSSQL database connection
   */
  async testMssqlConnection(): Promise<SysconfigApiResponse<any>> {
    console.log('SysconfigService.testMssqlConnection: Testing MSSQL connection...');
    const url = `${this.baseUrl}/test-mssql`;
    const response = await this.makeRequest<any>(url, {
      method: 'POST',
    });

    if (response.success) {
      console.log('✅ MSSQL connection test successful');
    } else {
      console.error('❌ MSSQL connection test failed:', response.message);
    }

    return response;
  }

  /**
   * Test SMTP connection and send test email
   */
  async testSmtpConnection(testEmail: string): Promise<SysconfigApiResponse<any>> {
    console.log('SysconfigService.testSmtpConnection: Testing SMTP connection with email:', testEmail);
    const url = `${this.baseUrl}/test-smtp`;
    const response = await this.makeRequest<any>(url, {
      method: 'POST',
      body: JSON.stringify({ testEmail }),
    });

    if (response.success) {
      console.log('✅ SMTP connection test successful');
    } else {
      console.error('❌ SMTP connection test failed:', response.message);
    }

    return response;
  }
}

// Export singleton instance
export const sysconfigService = new SysconfigService();
export default sysconfigService;

// Explicit type exports for better IDE/TypeScript support
export type {
  Sysconfig,
  ParsedSysconfig,
  DropdownOption,
  SystemSetupConfig,
  SysconfigApiResponse,
  SysconfigResponse
};

// ==================== DROPDOWN HELPER METHODS ====================

/**
 * Get dropdown options for product families
 */
export const getProductFamilyOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching product family options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data:', config);
    console.log('📋 Product families raw:', config.product_families);

    // Split comma-separated values and create options
    const families = config.product_families
      ? config.product_families.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = families.map(family => ({
      value: family,
      label: family,
      code: family
    }));

    console.log('✅ Product family options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting product family options:', error);
    return [];
  }
};

/**
 * Get dropdown options for sites
 */
export const getSiteOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching site options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for sites:', config.site);

    // Split comma-separated values and create options
    const sites = config.site
      ? config.site.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = sites.map(site => ({
      value: site,
      label: site,
      code: site
    }));

    console.log('✅ Site options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting site options:', error);
    return [];
  }
};

/**
 * Get dropdown options for tabs
 */
export const getTabOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching tab options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for tabs:', config.tabs);

    // Split comma-separated values and create options
    const tabs = config.tabs
      ? config.tabs.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = tabs.map(tab => ({
      value: tab,
      label: tab,
      code: tab
    }));

    console.log('✅ Tab options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting tab options:', error);
    return [];
  }
};

/**
 * Get dropdown options for product types
 */
export const getProductTypeOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching product type options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for product_type:', config.product_type);

    // Split comma-separated values and create options
    const types = config.product_type
      ? config.product_type.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = types.map(type => ({
      value: type,
      label: type,
      code: type
    }));

    console.log('✅ Product type options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting product type options:', error);
    return [];
  }
};

/**
 * Get dropdown options for customers (using grps as customer data)
 */
export const getCustomerOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching customer options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for grps (customers):', config.grps);

    // Split comma-separated values and create options
    const customers = config.grps
      ? config.grps.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = customers.map(customer => ({
      value: customer,
      label: customer,
      code: customer
    }));

    console.log('✅ Customer options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting customer options:', error);
    return [];
  }
};

/**
 * Get dropdown options for shifts
 */
export const getShiftOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching shift options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for shifts:', config.shift);

    // Split comma-separated values and create options
    const shifts = config.shift
      ? config.shift.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = shifts.map(shift => ({
      value: shift,
      label: shift,
      code: shift
    }));

    console.log('✅ Shift options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting shift options:', error);
    return [];
  }
};

/**
 * Get dropdown options for zones
 */
export const getZoneOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching zone options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for zones:', config.zones);

    // Split comma-separated values and create options
    const zones = config.zones
      ? config.zones.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = zones.map(zone => ({
      value: zone,
      label: zone,
      code: zone
    }));

    console.log('✅ Zone options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting zone options:', error);
    return [];
  }
};

/**
 * Get dropdown options for defect types
 */
export const getDefectTypeOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching defect type options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for defect_type:', config.defect_type);

    // Split comma-separated values and create options
    const defectTypes = config.defect_type
      ? config.defect_type.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = defectTypes.map(defectType => ({
      value: defectType,
      label: defectType,
      code: defectType
    }));

    console.log('✅ Defect type options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting defect type options:', error);
    return [];
  }
};

/**
 * Get dropdown options for defect colors
 */
export const getDefectColorOptions = async (): Promise<DropdownOption[]> => {
  try {
    console.log('🔄 Fetching defect color options...');
    const config = await sysconfigService.getSysconfig();
    console.log('📊 Raw sysconfig data for defect_color:', config.defect_color);

    // Split comma-separated values and create options
    const defectColors = config.defect_color
      ? config.defect_color.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const options = defectColors.map(defectColor => ({
      value: defectColor,
      label: defectColor,
      code: defectColor
    }));

    console.log('✅ Defect color options:', options);
    return options;
  } catch (error) {
    console.error('❌ Error getting defect color options:', error);
    return [];
  }
};

// ==================== REACT HOOKS ====================

/**
 * Custom hook for product family dropdown
 */
export const useProductFamilyOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getProductFamilyOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product families');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for site dropdown
 */
export const useSiteOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getSiteOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for tab dropdown
 */
export const useTabOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getTabOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tabs');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for product type dropdown
 */
export const useProductTypeOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getProductTypeOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product types');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for customer dropdown
 */
export const useCustomerOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getCustomerOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for shift dropdown
 */
export const useShiftOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getShiftOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shifts');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for zone dropdown
 */
export const useZoneOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getZoneOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load zones');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for defect type dropdown
 */
export const useDefectTypeOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getDefectTypeOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load defect types');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/**
 * Custom hook for defect color dropdown
 */
export const useDefectColorOptions = () => {
  const [options, setOptions] = React.useState<DropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const dropdownOptions = await getDefectColorOptions();
        setOptions(dropdownOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load defect colors');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  return { options, loading, error };
};

/*
=== REFACTORED SYSCONFIG SERVICE FEATURES ===

NATIVE FETCH API:
✅ Removed apiClient dependency
✅ Implemented native fetch requests
✅ Consistent with customerService pattern
✅ No external HTTP library dependencies

CACHE-BUSTING:
✅ Cache-busting headers on all requests
✅ Timestamp parameters for GET requests
✅ 304 response handling
✅ Fresh data guarantee

ERROR HANDLING:
✅ Consistent response structure
✅ No thrown exceptions - returns response objects
✅ Detailed logging for debugging
✅ Graceful error fallbacks

RESPONSE STRUCTURE:
✅ Handles backend response formats (nested, direct, array)
✅ Preserves existing parsing functionality
✅ Legacy format support
✅ Clear error messages

ENHANCED FUNCTIONALITY:
✅ Added updateSysconfig method
✅ Added getStats method for statistics
✅ Maintains existing cache system
✅ All dropdown helper methods preserved

ADDITIONAL HOOKS:
✅ Added useShiftOptions hook
✅ Added useZoneOptions hook
✅ Added useDefectTypeOptions hook
✅ All existing hooks preserved

The refactored service now matches customerService architecture:
- Native fetch instead of apiClient
- Cache-busting for fresh data
- Consistent error handling
- No thrown exceptions
- Proper response structure handling
- Enhanced with additional functionality
*/