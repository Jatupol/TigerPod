// server/src/entities/parts/service.ts
/**
 * SIMPLIFIED: Parts Entity Service - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import ISpecialService,{
  GenericSpecialService 
} from '../../generic/entities/special-entity/generic-service';

import {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PartsServiceResult,
  PartsListResult,
  PARTS_ENTITY_CONFIG
} from './types';

import { PartsModel } from './model';

// ==================== SIMPLE PARTS SERVICE CLASS ====================

/**
 * Simple Parts Entity Service - extends GenericSpecialService for basic business logic
 */
export class PartsService extends GenericSpecialService<Parts> implements ISpecialService<Parts> {

  protected partsModel: PartsModel;

  constructor(model: PartsModel) {
    super(model, PARTS_ENTITY_CONFIG);
    this.partsModel = model;
  }

  // ==================== REQUIRED ISPECIALSERVICE METHODS ====================

  /**
   * Get all parts with optional search and pagination
   */
  async getAll(searchTerm?: string, page?: number, limit?: number): Promise<PartsServiceResult<Parts[]>> {
    try {
      console.log('🔧 PartsService.getAll called', {
        searchTerm: searchTerm || 'none',
        page,
        limit
      });

      // Get paginated data
      const data = await this.partsModel.getAll(searchTerm, page, limit);

      // Get total count for pagination metadata
      let total = data.length;
      if (page && limit) {
        total = await this.partsModel.getCount(searchTerm);
      }

      const result: any = {
        success: true,
        data: data
      };

      // Add pagination metadata if pagination is requested
      if (page && limit) {
        result.pagination = {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        };
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error getting all parts:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve parts'
      };
    }
  }

  /**
   * Get part by partno
   */
  async getByKey(keyValues: Record<string, any>): Promise<PartsServiceResult<Parts>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.getByKey called:', { partno });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      const data = await this.partsModel.getByKey({ partno });

      if (data) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          message: 'Part not found' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error getting part by key:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve part' 
      };
    }
  }

  /**
   * Import new part
   */
  async import(data: CreatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      console.log('🔧 PartsService.create called:', { partno: data.partno, userId });

      // Basic validation
      const validation = this.validateImportData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}` 
        };
      }
 

      // Add audit fields and resolved customer/site data (if available)
      const createData = {
        ...data,
        created_by: userId,
        updated_by: userId
      };

      const result = await this.partsModel.replace(createData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part created successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to create part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating part:', error);

      return {
        success: false,
        message: error.message || 'Failed to create part' 
      };
    }
  }

  /**
   * Create new part
   */
  async create(data: CreatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      console.log('🔧 PartsService.create called:', { partno: data.partno, userId });

      // Basic validation
      const validation = this.validateCreateData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}` 
        };
      }

      // Resolve customer and part_site from customer_site_code (if provided)
      let customerSiteData = null;
      if (data.customer_site_code?.trim()) {
        customerSiteData = await this.resolveCustomerSite(data.customer_site_code);
        if (!customerSiteData) {
          return {
            success: false,
            message: 'Invalid customer-site code'
          };
        }
      }

      // Add audit fields and resolved customer/site data (if available)
      const createData = {
        ...data,
        customer: customerSiteData?.customer || undefined,
        part_site: customerSiteData?.site || undefined,
        created_by: userId,
        updated_by: userId
      };

      const result = await this.partsModel.create(createData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part created successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to create part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating part:', error);

      return {
        success: false,
        message: error.message || 'Failed to create part' 
      };
    }
  }

  /**
   * Update part by partno
   */
  async update(keyValues: Record<string, any>, data: UpdatePartsRequest, userId: number = 0): Promise<PartsServiceResult<Parts>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.update called:', { partno, userId });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      // Add audit fields
      const updateData = {
        ...data,
        updated_by: userId
      };

      const result = await this.partsModel.update({ partno }, updateData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Part updated successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to update part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error updating part:', error);

      return {
        success: false,
        message: error.message || 'Failed to update part' 
      };
    }
  }

  /**
   * Delete part by partno
   */
  async delete(keyValues: Record<string, any>): Promise<PartsServiceResult<boolean>> {
    try {
      const { partno } = keyValues;

      console.log('🔧 PartsService.delete called:', { partno });

      if (!partno) {
        return {
          success: false,
          message: 'Part number is required' 
        };
      }

      const result = await this.partsModel.delete({ partno });

      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Part deleted successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to delete part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error deleting part:', error);

      return {
        success: false,
        message: error.message || 'Failed to delete part' 
      };
    }
  }

  /**
   * Synchronize data method from  inf_lotinput 
   */
  async synceData(): Promise<PartsServiceResult<boolean>> {
    try {
      
      console.log('🔧 Executing parts Synchronize data  ');

      const result = await this.partsModel.synceData();

      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Part dSynchronize data successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to Synchronize data part' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error Synchronize data part:', error);

      return {
        success: false,
        message: error.message || 'Failed to Synchronize data part' 
      };
    }
  }

  /**
   * Check if part exists by partno
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return false;
      }

      return await this.partsModel.exists({ partno });
    } catch (error: any) {
      console.error('❌ Error checking part existence:', error);
      return false;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Resolve customer and site from customer_site_code
   */
  private async resolveCustomerSite(customerSiteCode: string): Promise<{ customer: string; site: string } | null> {
    try {
      if (!customerSiteCode) {
        return null;
      }
      const result = await this.partsModel.resolveCustomerSite(customerSiteCode);

      if (result.rows.length > 0) {
        return {
          customer: result.rows[0].customers,
          site: result.rows[0].site
        };
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error resolving customer-site:', error);
      return null;
    }
  }

  /**
   * GET /api/parts/customer-sites
   * Get available customer-sites for parts form
   */
   async getCustomerSites(): Promise<any> {
    try {
   
      const result = await this.partsModel.getCustomerSites();

      if (result.rows.length > 0) {
        return result;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error getting customer-sites:', error);
      return null;
    } 
  };

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate create data
   */
  private validateCreateData(data: CreatePartsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation - Only partno is mandatory
    if (!data.partno?.trim()) {
      errors.push('Part number is required');
    }

    // Optional field warnings (not errors) - commented out for flexible imports
   
    if (!data.product_families?.trim()) {
      errors.push('Product families is required');
    }

    if (!data.versions?.trim()) {
      errors.push('Versions is required');
    }

    if (!data.production_site?.trim()) {
      errors.push('Production site is required');
    }

    if (!data.customer_site_code?.trim()) {
      errors.push('Customer-site is required');
    }

    if (!data.tab?.trim()) {
      errors.push('Tab is required');
    }

    if (!data.product_type?.trim()) {
      errors.push('Product type is required');
    }

    if (!data.customer_driver?.trim()) {
      errors.push('Customer driver is required');
    }
   
    // Length validations
    if (data.partno && data.partno.length > 25) {
      errors.push('Part number must be 25 characters or less');
    }

    if (data.product_families && data.product_families.length > 10) {
      errors.push('Product families must be 10 characters or less');
    }

    if (data.versions && data.versions.length > 10) {
      errors.push('Versions must be 10 characters or less');
    }

    if (data.customer_driver && data.customer_driver.length > 200) {
      errors.push('Customer driver must be 200 characters or less');
    }

    // Code field validations (must be exactly 5 characters)
    /*
    const codeFields = [
      { field: 'production_site', value: data.production_site },
      { field: 'tab', value: data.tab },
      { field: 'product_type', value: data.product_type }
    ];

    codeFields.forEach(({ field, value }) => {
      if (value && value.length !== 5) {
        errors.push(`${field.replace('_', ' ')} must be exactly 5 characters`);
      }
    });
   */
    // Customer-site code validation (max 10 characters)
    if (data.customer_site_code && data.customer_site_code.length > 10) {
      errors.push('Customer-site code must be 10 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate import data
   */
  private validateImportData(data: CreatePartsRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation - Only partno is mandatory
    if (!data.partno?.trim()) {
      errors.push('Part number is required');
    }

 
    return {
      isValid: errors.length === 0,
      errors
    };
  }  
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Parts service instance
 */
export function createPartsService(model: PartsModel): PartsService {
  return new PartsService(model);
}

export default PartsService;