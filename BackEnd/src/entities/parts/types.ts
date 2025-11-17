// server/src/entities/parts/types.ts
/**
 * SIMPLIFIED: Parts Entity Types - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import {
  BaseSpecialEntity,
  SpecialEntityRequest,
  SpecialQueryOptions,
  SpecialApiResponse,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// ==================== CORE PARTS ENTITY INTERFACE ====================

/**
 * Parts entity interface - Simple special pattern with partno as primary key
 */
export interface Parts extends BaseSpecialEntity {
  // Primary Key Field
  partno: string;                    // VARCHAR(25) PRIMARY KEY

  // Required Fields
  product_families: string;          // VARCHAR(10) NOT NULL
  versions: string;                  // VARCHAR(10) NOT NULL
  production_site: string;           // VARCHAR(5) NOT NULL
  part_site: string;                 // VARCHAR(5) NOT NULL
  customer: string;                  // VARCHAR(5) NOT NULL
  tab: string;                       // VARCHAR(5) NOT NULL
  product_type: string;              // VARCHAR(5) NOT NULL
  customer_driver: string;           // VARCHAR(200) NOT NULL

  // Standard Entity Fields (inherited from BaseSpecialEntity)
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;

  // Additional fields from JOINs (optional)
  customer_site_code?: string;       // From customer-site relationship
  customer_name?: string;            // From customers table

  // Search highlighting (optional)
  highlight?: Record<string, string>; // Highlighted search results
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create Parts Request
 */
export interface CreatePartsRequest {
  partno: string;
  product_families: string;
  versions: string;
  production_site: string;
  customer_site_code: string;        // Use customer-site relationship
  tab: string;
  product_type: string;
  customer_driver: string;
  is_active?: boolean;

  // Derived fields (populated from customer_site_code)
  customer?: string;                 // Derived from customer-site
  part_site?: string;                // Derived from customer-site
}

/**
 * Update Parts Request
 */
export interface UpdatePartsRequest {
  product_families?: string;
  versions?: string;
  production_site?: string;
  part_site?: string;
  customer?: string;
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: boolean;
}

/**
 * Parts Query Parameters
 */
export interface PartsQueryParams extends SpecialQueryOptions {
  // Parts-specific filters
  customer?: string;
  production_site?: string;
  part_site?: string;
  product_type?: string;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * Parts Primary Key Configuration
 */
export const PARTS_PRIMARY_KEY_CONFIG: PrimaryKeyConfig = {
  fields: ['partno'],
  routes: [':partno'],
  routePattern: '/:partno'
};

/**
 * Parts Entity Configuration for Special Pattern
 */
export const PARTS_ENTITY_CONFIG: SpecialEntityConfig = {
  entityName: 'parts',
  tableName: 'parts',
  apiPath: '/api/parts',
  primaryKey: PARTS_PRIMARY_KEY_CONFIG,
  searchableFields: [
    'partno',
    'product_families',
    'versions',
    'production_site',
    'part_site',
    'customer',
    'tab',
    'product_type',
    'customer_driver'
  ],
  requiredFields: [
    'partno',
    'product_families',
    'versions',
    'production_site',
    'part_site',
    'customer',
    'tab',
    'product_type',
    'customer_driver'
  ],
  defaultLimit: 20,
  maxLimit: 100
};

// ==================== SERVICE RESULT TYPES ====================

export type PartsServiceResult<T = Parts> = SpecialApiResponse<T>;
export type PartsListResult = SpecialApiResponse<Parts[]>;
export type PartsCreateResult = SpecialApiResponse<Parts>;
export type PartsUpdateResult = SpecialApiResponse<Parts>;
export type PartsDeleteResult = SpecialApiResponse<boolean>;

// ==================== REQUEST INTERFACE ====================

export interface PartsEntityRequest extends SpecialEntityRequest {
  params: {
    partno?: string;
    [key: string]: string | undefined;
  };
}

export default Parts;