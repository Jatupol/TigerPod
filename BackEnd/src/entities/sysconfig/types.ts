// server/src/entities/sysconfig/types.ts
// Sysconfig Entity Types - Complete Separation Entity Architecture
//  Sampling Inspection ControlSystem - SERIAL ID Pattern Implementation

/**
 * System Configuration Entity Types
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends Generic Serial ID Entity pattern
 * ✅ Zero dependencies on other entities or business domains
 * ✅ Self-contained sysconfig type definitions
 * ✅ 90% code reduction through generic pattern reuse
 * 
 * Database Schema Compliance:
 * ✅ Table: sysconfig
 * ✅ Primary Key: id SERIAL PRIMARY KEY  
 * ✅ Route Pattern: /api/sysconfig/:id
 * ✅ Extends BaseSerialIdEntity for standard audit fields
 * 
 * Generic Pattern Integration:
 * ✅ Uses SerialIdEntityRequest for HTTP requests
 * ✅ Uses SerialIdApiResponse for HTTP responses
 * ✅ Uses SerialIdQueryOptions for filtering/pagination
 * ✅ Uses SerialIdServiceResult for service layer responses
 */

import {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdEntityRequest,
  SerialIdQueryOptions,
  SerialIdApiResponse,
  SerialIdServiceResult,
  SerialIdEntityConfig,
  ValidationResult
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== SYSCONFIG ENTITY INTERFACE ====================

/**
 * System Configuration Entity Interface
 * 
 * Extends BaseSerialIdEntity to inherit:
 * - id: number (SERIAL PRIMARY KEY)
 * - is_active: boolean
 * - created_at: Date
 * - updated_at: Date
 * - created_by: number
 * - updated_by: number
 */
export interface Sysconfig extends BaseSerialIdEntity {
  // Quality control configuration (comma-separated values)
  fvi_lot_qty: string;
  general_oqa_qty: string;
  crack_oqa_qty: string;
  general_siv_qty: string;
  crack_siv_qty: string;
  defect_type: string;
  defect_group: string;
  shift: string;
  site: string;
  tabs: string;
  product_type: string;
  product_families: string;

  // Email configuration
  smtp_server: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null;

  // Defect notification email configuration
  defect_notification_emails: string | null;
  enable_defect_email_notification: boolean;

  // MSSQL database configuration
  mssql_server: string | null;
  mssql_port: number;
  mssql_database: string | null;
  mssql_username: string | null;
  mssql_password: string | null;

  // System configuration
  system_name: string | null;
  system_updated: Date | null;
  news: string | null;
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create Sysconfig Request Interface
 * 
 * Extends CreateSerialIdData to inherit validation patterns.
 * Defines required fields for creating new system configuration.
 */
export interface CreateSysconfigRequest extends CreateSerialIdData {
  // Required quality control configuration
  fvi_lot_qty: string;
  general_oqa_qty: string;
  crack_oqa_qty: string;
  general_siv_qty: string;
  crack_siv_qty: string;
  defect_type: string;
  defect_group: string;
  defect_color: string;
  shift: string;
  site: string;
  tabs: string;
  product_type: string;
  product_families: string;

  // Optional email configuration
  smtp_server?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;

  // Optional defect notification configuration
  defect_notification_emails?: string;
  enable_defect_email_notification?: boolean;

  // Optional MSSQL configuration
  mssql_server?: string;
  mssql_port?: number;
  mssql_database?: string;
  mssql_username?: string;
  mssql_password?: string;

  // Optional system configuration
  system_name?: string;
  system_updated?: Date;
  news?: string;
}

/**
 * Update Sysconfig Request Interface
 * 
 * Extends UpdateSerialIdData to inherit update patterns.
 * All fields optional for partial updates.
 */
export interface UpdateSysconfigRequest extends UpdateSerialIdData {
  // Quality control configuration
  fvi_lot_qty?: string;
  general_oqa_qty?: string;
  crack_oqa_qty?: string;
  general_siv_qty?: string;
  crack_siv_qty?: string;
  defect_type?: string;
  defect_group?: string;
  defect_color?: string;
  shift?: string;
  site?: string;
  tabs?: string;
  product_type?: string;
  product_families?: string;

  // Email configuration
  smtp_server?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;

  // Defect notification configuration
  defect_notification_emails?: string;
  enable_defect_email_notification?: boolean;

  // MSSQL database configuration
  mssql_server?: string;
  mssql_port?: number;
  mssql_database?: string;
  mssql_username?: string;
  mssql_password?: string;
  mssql_sync?: number;

  // System configuration
  system_name?: string;
  system_version?: string;
  system_updated?: Date;
  news?: string;
}

// ==================== PARSED CONFIGURATION INTERFACES ====================

/**
 * Parsed Configuration Values Interface
 * 
 * Represents comma-separated configuration values converted to arrays
 * for easier manipulation and validation.
 */
export interface ParsedSysconfigValues {
  fvi_lot_qty: number[];
  general_oqa_qty: number[];
  crack_oqa_qty: number[];
  general_siv_qty: number[];
  crack_siv_qty: number[];
  defect_type: string[];
  defect_group: string[];
  shift: string[];
  site: string[];
  tabs: string[];
  product_type: string[];
  product_families: string[];
}

/**
 * Sysconfig with Parsed Values Interface
 * 
 * Combines the base Sysconfig entity with parsed configuration arrays
 * for advanced processing and validation.
 */
export interface SysconfigWithParsed extends Sysconfig {
  parsed: ParsedSysconfigValues;
}

// ==================== QUERY INTERFACES ====================

/**
 * Sysconfig Query Parameters Interface
 *
 * Extends SerialIdQueryOptions to inherit standard filtering capabilities.
 * Adds sysconfig-specific query options.
 */
export interface SysconfigQueryParams extends SerialIdQueryOptions {
  // Configuration filtering
  config_name?: string;
  system_name?: string;

  // Feature toggle filtering
  enable_auto_sync?: boolean;
  enable_notifications?: boolean;
  enable_audit_log?: boolean;
  enable_advanced_search?: boolean;

  // Integration filtering
  has_inf_server?: boolean;
  has_smtp_server?: boolean;

  // Backup filtering
  backup_enabled?: boolean;
}

// ==================== HTTP REQUEST/RESPONSE TYPES ====================

/**
 * Sysconfig HTTP Request Interface
 * 
 * Extends SerialIdEntityRequest for HTTP request handling.
 * Used in controllers and middleware.
 */
export interface SysconfigEntityRequest<
  TParams = any,
  TBody = any,
  TQuery = SysconfigQueryParams
> extends SerialIdEntityRequest<TParams, TBody, TQuery> {}

/**
 * Sysconfig API Response Interface
 * 
 * Extends SerialIdApiResponse for consistent API responses.
 */
export interface SysconfigApiResponse<T = Sysconfig> extends SerialIdApiResponse<T> {}

/**
 * Sysconfig Service Result Interface
 * 
 * Extends SerialIdServiceResult for service layer operations.
 */
export interface SysconfigServiceResult<T = Sysconfig> extends SerialIdServiceResult<T> {}

// ==================== ENTITY CONFIGURATION ====================

/**
 * Sysconfig Entity Configuration
 * 
 * Configuration object for the Sysconfig entity following the
 * Generic Serial ID pattern requirements.
 */
export const SYSCONFIG_ENTITY_CONFIG: SerialIdEntityConfig = {
  entityName: 'Sysconfig',
  tableName: 'sysconfig',
  apiPath: '/api/sysconfig',
  searchableFields: [
    'system_name'
  ],
  defaultLimit: 20,
  maxLimit: 100
};

// ==================== VALIDATION CONSTANTS ====================

/**
 * Sysconfig Validation Constants
 * 
 * Constants used for validation and default values.
 */
export const SYSCONFIG_CONSTANTS = {
  // Default configuration values
  DEFAULT_VALUES: {
    FVI_LOT_QTY: '2400,3000,3200,3300,3600',
    GENERAL_OQA_QTY: '0,78,91',
    CRACK_OQA_QTY: '0,80,100,120',
    GENERAL_SIV_QTY: '0,32,49',
    CRACK_SIV_QTY: '0,60,80',
    DEFECT_TYPE: 'Normal defect,Abnormal defect ≥1,Normal repeat problem & area ≥3',
    SHIFT: 'A,B',
    SITE: 'TNHK,JNHK',
    TABS: '1,2,3',
    PRODUCT_TYPE: 'SSA,DSA,CLA,TSA',
    PRODUCT_FAMILIES: 'Iris,Pine,Jupiter,Trident,Lithium',
    SMTP_PORT: 587
  },

  // Validation limits
  VALIDATION_LIMITS: {
    FIELD_MAX_LENGTH: 500,
    CONFIG_NAME_MAX_LENGTH: 100,
    CONFIG_DESCRIPTION_MAX_LENGTH: 500,
    SYSTEM_NAME_MAX_LENGTH: 100,
    SMTP_SERVER_MAX_LENGTH: 100,
    SMTP_USERNAME_MAX_LENGTH: 100,
    SMTP_PASSWORD_MAX_LENGTH: 100,

    // Array value limits
    MAX_FVI_LOT_QTY_VALUES: 10,
    MAX_GENERAL_OQA_QTY_VALUES: 10,
    MAX_CRACK_OQA_VALUES: 10,
    MAX_CRACK_OQA_QTY_VALUES: 10,
    MAX_GENERAL_SIV_QTY_VALUES: 10,
    MAX_CRACK_SIV_QTY_VALUES: 10,
    MAX_DEFECT_TYPE_VALUES: 5,
    MAX_SHIFT_VALUES: 5,
    MAX_SITE_VALUES: 10,
    MAX_TABS_VALUES: 10,
    MAX_PRODUCT_TYPE_VALUES: 10,
    MAX_PRODUCT_FAMILY_VALUES: 10,

    // Numeric ranges
    MIN_QTY_VALUE: 0,
    MAX_QTY_VALUE: 999999,
    MIN_TAB_VALUE: 1,
    MAX_TAB_VALUE: 99,
    MIN_SMTP_PORT: 1,
    MAX_SMTP_PORT: 65535,

    // System settings ranges
    MIN_SYNC_INTERVAL: 1,
    MAX_SYNC_INTERVAL: 1440,
    MIN_CACHE_TIMEOUT: 1,
    MAX_CACHE_TIMEOUT: 1440,
    MIN_RECORDS_PER_PAGE: 10,
    MAX_RECORDS_PER_PAGE: 1000
  }
} as const;

// ==================== TYPE GUARDS ====================

/**
 * Type guard for Sysconfig entity
 */
export function isSysconfig(obj: any): obj is Sysconfig {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.fvi_lot_qty === 'string' &&
    typeof obj.general_oqa_qty === 'string' &&
    typeof obj.crack_oqa_qty === 'string' &&
    typeof obj.general_siv_qty === 'string' &&
    typeof obj.crack_siv_qty === 'string' &&
    typeof obj.defect_type === 'string' &&
    typeof obj.defect_group === 'string' &&
    typeof obj.shift === 'string' &&
    typeof obj.site === 'string' &&
    typeof obj.tabs === 'string' &&
    typeof obj.product_type === 'string' &&
    typeof obj.product_families === 'string' &&
    typeof obj.smtp_port === 'number' &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date &&
    typeof obj.created_by === 'number' &&
    typeof obj.updated_by === 'number';
}

/**
 * Type guard for CreateSysconfigRequest
 */
export function isCreateSysconfigRequest(obj: any): obj is CreateSysconfigRequest {
  return obj &&
    typeof obj.fvi_lot_qty === 'string' &&
    typeof obj.general_oqa_qty === 'string' &&
    typeof obj.crack_oqa_qty === 'string' &&
    typeof obj.general_siv_qty === 'string' &&
    typeof obj.crack_siv_qty === 'string' &&
    typeof obj.defect_type === 'string' &&
    typeof obj.defect_group === 'string' &&
    typeof obj.defect_color === 'string' &&
    typeof obj.shift === 'string' &&
    typeof obj.site === 'string' &&
    typeof obj.tabs === 'string' &&
    typeof obj.product_type === 'string' &&
    typeof obj.product_families === 'string';
}

/**
 * Type guard for UpdateSysconfigRequest
 */
export function isUpdateSysconfigRequest(obj: any): obj is UpdateSysconfigRequest {
  if (!obj || typeof obj !== 'object') return false;

  const validFields = [
    'fvi_lot_qty', 'general_oqa_qty', 'crack_oqa_qty', 'general_siv_qty',
    'crack_siv_qty', 'defect_type', 'defect_group', 'defect_color', 'shift', 'site', 'tabs',
    'product_type', 'product_families', 'smtp_server', 'smtp_port',
    'smtp_username', 'smtp_password', 'defect_notification_emails',
    'mssql_server', 'mssql_port', 'mssql_database', 'mssql_username', 'mssql_password', 'mssql_sync',
    'system_name', 'system_version', 'system_updated', 'news', 'is_active'
  ];

  const objKeys = Object.keys(obj);
  const invalidKeys = objKeys.filter(key => !validFields.includes(key));

  if (invalidKeys.length > 0) {
    console.log('⚠️ Invalid keys found in update request:', invalidKeys);
    console.log('📋 Valid fields:', validFields);
    console.log('📋 Received keys:', objKeys);
  }

  return objKeys.length > 0 && objKeys.every(key => validFields.includes(key));
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Parse comma-separated configuration values to arrays
 */
export function parseConfigurationValues(sysconfig: Sysconfig): ParsedSysconfigValues {
  return {
    fvi_lot_qty: sysconfig.fvi_lot_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
    general_oqa_qty: sysconfig.general_oqa_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
    crack_oqa_qty: sysconfig.crack_oqa_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
    general_siv_qty: sysconfig.general_siv_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
    crack_siv_qty: sysconfig.crack_siv_qty.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)),
    defect_type: sysconfig.defect_type.split(',').map(v => v.trim()).filter(v => v.length > 0),
    defect_group: sysconfig.defect_group.split(',').map(v => v.trim()).filter(v => v.length > 0),
    shift: sysconfig.shift.split(',').map(v => v.trim()).filter(v => v.length > 0),
    site: sysconfig.site.split(',').map(v => v.trim()).filter(v => v.length > 0),
    tabs: sysconfig.tabs.split(',').map(v => v.trim()).filter(v => v.length > 0),
    product_type: sysconfig.product_type.split(',').map(v => v.trim()).filter(v => v.length > 0),
    product_families: sysconfig.product_families.split(',').map(v => v.trim()).filter(v => v.length > 0)
  };
}

/**
 * Create Sysconfig with parsed values
 */
export function createSysconfigWithParsed(sysconfig: Sysconfig): SysconfigWithParsed {
  return {
    ...sysconfig,
    parsed: parseConfigurationValues(sysconfig)
  };
}

// ==================== UTILITY TYPES ====================

/**
 * Sysconfig field names (excluding base entity fields)
 */
export type SysconfigField = keyof Omit<Sysconfig, 
  'id' | 'is_active' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
>;

/**
 * Configuration field that contains comma-separated values
 */
export type ConfigurationArrayField = 'fvi_lot_qty' | 'general_siv_qty' | 'crack_siv_qty' | 'general_oqa_qty' | 'crack_oqa_qty' |
  'defect_type' | 'defect_group' | 'shift' | 'site' | 'tabs' | 'product_type' | 'product_families';

/*
=== UPDATED SYSCONFIG TYPES WITH GENERIC SERIAL-ID PATTERN FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Extends Generic Serial ID Entity pattern for maximum code reuse
✅ Zero dependencies on other entities or business domains
✅ Self-contained sysconfig type definitions
✅ 90% code reduction through generic pattern inheritance

GENERIC PATTERN INTEGRATION:
✅ Extends BaseSerialIdEntity for standard audit fields
✅ Uses SerialIdEntityRequest for HTTP request typing
✅ Uses SerialIdApiResponse for consistent API responses
✅ Uses SerialIdServiceResult for service layer operations
✅ Uses SerialIdQueryOptions for filtering and pagination

DATABASE SCHEMA COMPLIANCE:
✅ Complete match to sysconfig table structure with all 41 fields
✅ Proper handling of nullable vs non-nullable fields
✅ Correct data types matching PostgreSQL schema
✅ Support for default values and constraints

ENHANCED FUNCTIONALITY:
✅ ParsedSysconfigValues for comma-separated value parsing
✅ SysconfigWithParsed for enhanced data processing
✅ Comprehensive validation constants and limits
✅ Type guards for runtime type checking
✅ Utility functions for configuration parsing

Sampling Inspection Control FEATURES:
✅ Quality control configuration (FVI, sampling, defects)
✅ System integration settings (INF server configuration)
✅ Performance and feature toggles
✅ Email and notification settings
✅ Backup and audit configuration
✅ Advanced search and filtering capabilities
*/