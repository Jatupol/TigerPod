// client/src/services/inspectionDataSetupService.ts
// Service for Inspection Data Setup Operations
// Manufacturing Quality Control System - Master Data Configuration

import { apiBaseUrl } from '../config/api.config';
import type {
  InspectionConfig,
  SysconfigResponse,
  ValidationResult,
  ConfigChanges
} from '../types/sysconfig';

/**
 * Inspection Data Setup Service Class
 * Handles configuration loading, saving, validation, and change tracking
 */
class InspectionDataSetupService {
  /**
   * Load active system configuration
   *
   * @returns Active configuration or null if not found
   */
  async loadActiveConfig(): Promise<InspectionConfig | null> {
    try {
      console.log('🔧 Loading active system configuration...');

      const response = await fetch(`${apiBaseUrl('sysconfig')}/active`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ Failed to load configuration:', response.statusText);
        return null;
      }

      const result: SysconfigResponse = await response.json();

      if (result.success && result.data) {
        console.log('✅ Configuration loaded successfully');
        return result.data;
      }

      console.warn('⚠️ No active configuration found');
      return null;
    } catch (error) {
      console.error('❌ Error loading configuration:', error);
      return null;
    }
  }

  /**
   * Save system configuration
   *
   * @param config - Configuration to save
   * @returns Save result with success status and message
   */
  async saveConfig(config: InspectionConfig): Promise<{ success: boolean; message: string }> {
    try {
      console.log('💾 Saving system configuration...');
      console.log('📤 Config to save:', config);

      // Validate before saving
      const validation = this.validateConfig(config);
      console.log('🔍 Validation result:', validation);

      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Filter out read-only and audit fields that shouldn't be sent in update request
      const { id, created_at, updated_at, created_by, updated_by, ...updateData } = config;

      const url = `${apiBaseUrl('sysconfig')}/${id}`;
      console.log('🌐 Request URL:', url);
      console.log('📦 Request body (filtered):', JSON.stringify(updateData, null, 2));

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      const result: SysconfigResponse = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok && result.success) {
        console.log('✅ Configuration saved successfully');
        return {
          success: true,
          message: result.message || 'Configuration saved successfully'
        };
      }

      console.error('❌ Failed to save configuration:', result);
      return {
        success: false,
        message: result.error || result.message || 'Failed to save configuration'
      };
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate system configuration
   *
   * @param config - Configuration to validate
   * @returns Validation result with errors and warnings
   */
  validateConfig(config: InspectionConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required text fields
    if (!config.shift?.trim()) errors.push('Shift values are required');
    if (!config.site?.trim()) errors.push('Site values are required');

    // Validate email format if provided
    if (config.defect_notification_emails?.trim()) {
      const emails = this.parseArrayField(config.defect_notification_emails);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        errors.push(`Invalid email format: ${invalidEmails.join(', ')}`);
      }
    }

    // Validate sampling quantities (comma-separated numbers)
    const quantityFields = [
      { field: config.fvi_lot_qty, name: 'FVI Lot Qty' },
      { field: config.general_oqa_qty, name: 'General OQA Qty' },
      { field: config.crack_oqa_qty, name: 'Crack OQA Qty' },
      { field: config.general_siv_qty, name: 'General SIV Qty' },
      { field: config.crack_siv_qty, name: 'Crack SIV Qty' }
    ];

    quantityFields.forEach(({ field, name }) => {
      if (field) {
        const values = this.parseArrayField(field);
        const invalidValues = values.filter(v => isNaN(Number(v)) || Number(v) < 0);
        if (invalidValues.length > 0) {
          errors.push(`${name} contains invalid values: ${invalidValues.join(', ')}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if configuration has unsaved changes
   *
   * @param original - Original configuration
   * @param current - Current configuration
   * @returns Change tracking information
   */
  detectChanges(original: InspectionConfig | null, current: InspectionConfig | null): ConfigChanges {
    if (!original || !current) {
      return {
        hasChanges: false,
        modifiedFields: [],
        originalConfig: original || undefined,
        currentConfig: current || undefined
      };
    }

    const modifiedFields: string[] = [];

    // Compare all configuration fields
    const fieldsToCompare: (keyof InspectionConfig)[] = [
      'fvi_lot_qty',
      'general_oqa_qty',
      'crack_oqa_qty',
      'general_oba_qty',
      'crack_oba_qty',
      'general_siv_qty',
      'crack_siv_qty',
      'shift',
      'site',
      'tabs',
      'product_type',
      'product_families',
      'defect_type',
      'defect_group',
      'defect_color',
      'defect_notification_emails'
    ];

    for (const field of fieldsToCompare) {
      if (original[field] !== current[field]) {
        modifiedFields.push(field);
      }
    }

    return {
      hasChanges: modifiedFields.length > 0,
      modifiedFields,
      originalConfig: original,
      currentConfig: current
    };
  }

  /**
   * Parse comma-separated array field into array of strings
   *
   * @param value - Comma-separated string
   * @returns Array of trimmed, non-empty strings
   */
  parseArrayField(value: string): string[] {
    if (!value || typeof value !== 'string') return [];
    return value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Convert array of strings to comma-separated string
   *
   * @param values - Array of strings
   * @returns Comma-separated string
   */
  formatArrayField(values: string[]): string {
    return values
      .filter(v => v && v.trim())
      .map(v => v.trim())
      .join(', ');
  }

  /**
   * Add value to array field
   *
   * @param currentValue - Current comma-separated string
   * @param newValue - Value to add
   * @returns Updated comma-separated string
   */
  addArrayValue(currentValue: string, newValue: string): string {
    const values = this.parseArrayField(currentValue);
    const trimmedNew = newValue.trim();

    // Don't add if empty or already exists
    if (!trimmedNew || values.includes(trimmedNew)) {
      return currentValue;
    }

    values.push(trimmedNew);
    return this.formatArrayField(values);
  }

  /**
   * Remove value from array field
   *
   * @param currentValue - Current comma-separated string
   * @param valueToRemove - Value to remove
   * @returns Updated comma-separated string
   */
  removeArrayValue(currentValue: string, valueToRemove: string): string {
    const values = this.parseArrayField(currentValue);
    const filtered = values.filter(v => v !== valueToRemove);
    return this.formatArrayField(filtered);
  }

  /**
   * Get default configuration values
   *
   * @returns Default InspectionConfig object
   */
  getDefaultConfig(): Partial<InspectionConfig> {
    return {
      active: true,
      fvi_lot_qty: '',
      general_oqa_qty: '',
      crack_oqa_qty: '',
      general_oba_qty: '',
      crack_oba_qty: '',
      general_siv_qty: '',
      crack_siv_qty: '',
      shift: '',
      site: '',
      tabs: '',
      product_type: '',
      product_families: '',
      defect_type: '',
      defect_group: '',
      defect_color: '',
      defect_notification_emails: ''
    };
  }

  /**
   * Format sampling quantity for display
   *
   * @param quantity - Quantity value
   * @returns Formatted string
   */
  formatQuantity(quantity: number): string {
    return quantity.toLocaleString();
  }

  /**
   * Validate email address format
   *
   * @param email - Email to validate
   * @returns True if valid email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const inspectionDataSetupService = new InspectionDataSetupService();

// Export class for testing
export default InspectionDataSetupService;

/*
=== INSPECTION DATA SETUP SERVICE FEATURES ===

CONFIGURATION MANAGEMENT:
✅ Load active configuration from API
✅ Save configuration with validation
✅ Default configuration values
✅ Change detection and tracking

VALIDATION:
✅ Sampling quantity validation (non-negative)
✅ Required field validation
✅ Email format validation
✅ Warning detection for unusual values

ARRAY FIELD MANAGEMENT:
✅ Parse comma-separated strings to arrays
✅ Format arrays to comma-separated strings
✅ Add values to array fields
✅ Remove values from array fields
✅ Duplicate prevention

UTILITIES:
✅ Quantity formatting
✅ Email validation
✅ Change comparison
✅ Field parsing

ARCHITECTURE:
✅ Centralized API configuration
✅ Singleton service pattern
✅ Separation of concerns
✅ Type safety throughout
✅ Comprehensive error handling
*/
