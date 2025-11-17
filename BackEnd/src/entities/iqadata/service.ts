// server/src/entities/iqadata/service.ts
/**
 * IQA Data Entity Service - SPECIAL Pattern Implementation
 * Manufacturing Quality Control System - Bulk Import & Analytics
 */

import { GenericSpecialService } from '../../generic/entities/special-entity/generic-service';
import {
  ISpecialService,
  SpecialServiceResult
} from '../../generic/entities/special-entity/generic-types';

import {
  IQAData,
  CreateIQADataRequest,
  UpdateIQADataRequest,
  BulkImportRequest,
  BulkImportResponse,
  DEFAULT_IQADATA_CONFIG
} from './types';

import { IQADataModel } from './model';

// ==================== IQA DATA SERVICE CLASS ====================

/**
 * IQA Data Entity Service - extends GenericSpecialService for business logic
 * with custom bulk import functionality
 */
export class IQADataService extends GenericSpecialService<IQAData> implements ISpecialService<IQAData> {

  protected iqaDataModel: IQADataModel;

  constructor(model: IQADataModel) {
    super(model, DEFAULT_IQADATA_CONFIG);
    this.iqaDataModel = model;
  }

  // ==================== REQUIRED ISPECIALSERVICE METHODS ====================

  /**
   * Get all IQA data with optional search
   */
  async getAll(searchTerm?: string): Promise<SpecialServiceResult<IQAData[]>> {
    try {
      console.log('🔧 IQADataService.getAll called', searchTerm ? `with search: "${searchTerm}"` : '');

      const data = await this.iqaDataModel.getAll(searchTerm);

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      console.error('❌ Error getting all IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to retrieve IQA data'
      };
    }
  }

  /**
   * Get IQA data by id
   */
  async getByKey(keyValues: Record<string, any>): Promise<SpecialServiceResult<IQAData>> {
    try {
      const { id } = keyValues;

      console.log('🔧 IQADataService.getByKey called:', { id });

      if (!id) {
        return {
          success: false,
          error: 'ID is required'
        };
      }

      const data = await this.iqaDataModel.getByKey({ id });

      if (!data) {
        return {
          success: false,
          error: `IQA data with ID ${id} not found`
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error: any) {
      console.error('❌ Error getting IQA data by key:', error);

      return {
        success: false,
        error: error.message || 'Failed to retrieve IQA data'
      };
    }
  }

  /**
   * Create new IQA data record
   */
  async create(data: CreateIQADataRequest, userId: number): Promise<SpecialServiceResult<IQAData>> {
    try {
      console.log('🔧 IQADataService.create called:', { userId });

      const result = await this.iqaDataModel.create(data, userId);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to create IQA data'
        };
      }

      return {
        success: true,
        data: result.data!
      };
    } catch (error: any) {
      console.error('❌ Error creating IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to create IQA data'
      };
    }
  }

  /**
   * Update existing IQA data record
   */
  async update(keyValues: Record<string, any>, data: UpdateIQADataRequest, userId: number): Promise<SpecialServiceResult<IQAData>> {
    try {
      const { id } = keyValues;

      console.log('🔧 IQADataService.update called:', { id, userId });

      if (!id) {
        return {
          success: false,
          error: 'ID is required for update'
        };
      }

      const result = await this.iqaDataModel.update({ id }, data, userId);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update IQA data'
        };
      }

      return {
        success: true,
        data: result.data!
      };
    } catch (error: any) {
      console.error('❌ Error updating IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to update IQA data'
      };
    }
  }

  /**
   * Delete IQA data record
   */
  async delete(keyValues: Record<string, any>): Promise<SpecialServiceResult<boolean>> {
    try {
      const { id } = keyValues;

      console.log('🔧 IQADataService.delete called:', { id });

      if (!id) {
        return {
          success: false,
          error: 'ID is required for delete'
        };
      }

      const result = await this.iqaDataModel.delete({ id });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to delete IQA data'
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error: any) {
      console.error('❌ Error deleting IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to delete IQA data'
      };
    }
  }

  // ==================== IQA-SPECIFIC OPERATIONS ====================

  /**
   * Bulk import IQA data records
   * Handles bulk import of IQA data from Excel files
   */
  async bulkImport(request: BulkImportRequest, userId?: number): Promise<SpecialServiceResult<BulkImportResponse>> {
    try {
      console.log('🔧 IQADataService.bulkImport called:', { recordCount: request.data.length });

      // Validate request
      if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
        return {
          success: false,
          error: 'Import data is required and must be a non-empty array'
        };
      }

      if (request.data.length > 1000) {
        return {
          success: false,
          error: 'Maximum 1000 records can be imported at once'
        };
      }

      // Import records
      const importedRecords = await this.iqaDataModel.bulkCreate(request.data);

      const response: BulkImportResponse = {
        success: true,
        imported: importedRecords.length,
        failed: request.data.length - importedRecords.length,
        data: importedRecords
      };

      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      console.error('❌ Error bulk importing IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to bulk import IQA data'
      };
    }
  }

  /**
   * Upsert IQA data (Insert or Update based on unique constraint)
   * RULE 1: If data in all columns is same as existing, update it
   * RULE 2: Do not insert record if first column (FW) is blank or null (handled by frontend)
   */
  async upsert(request: BulkImportRequest, userId?: number): Promise<SpecialServiceResult<any>> {
    try {
      console.log('🔧 IQADataService.upsert called:', { recordCount: request.data.length });

      // Validate request
      if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
        return {
          success: false,
          error: 'Import data is required and must be a non-empty array'
        };
      }

      if (request.data.length > 1000) {
        return {
          success: false,
          error: 'Maximum 1000 records can be imported at once'
        };
      }

      // Upsert records using model
      const result = await this.iqaDataModel.upsert(request.data);

      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error('❌ Error upserting IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to upsert IQA data'
      };
    }
  }

  /**
   * Delete all IQA data records
   * Clears all IQA data (useful before re-import)
   */
  async deleteAll(userId?: number): Promise<SpecialServiceResult<number>> {
    try {
      console.log('🔧 IQADataService.deleteAll called:', { userId });

      const deletedCount = await this.iqaDataModel.deleteAll();

      return {
        success: true,
        data: deletedCount
      };
    } catch (error: any) {
      console.error('❌ Error deleting all IQA data:', error);

      return {
        success: false,
        error: error.message || 'Failed to delete all IQA data'
      };
    }
  }

  /**
   * Get distinct FY values
   * Used for filter dropdown
   */
  async getDistinctFY(): Promise<SpecialServiceResult<string[]>> {
    try {
      console.log('🔧 IQADataService.getDistinctFY called');

      const fyValues = await this.iqaDataModel.getDistinctFY();

      return {
        success: true,
        data: fyValues
      };
    } catch (error: any) {
      console.error('❌ Error getting distinct FY values:', error);

      return {
        success: false,
        error: error.message || 'Failed to get distinct FY values'
      };
    }
  }

  /**
   * Get distinct WW values
   * Used for filter dropdown
   * @param fy - Optional fiscal year to filter WW values
   */
  async getDistinctWW(fy?: string): Promise<SpecialServiceResult<string[]>> {
    try {
      console.log('🔧 IQADataService.getDistinctWW called', fy ? `with FY: ${fy}` : '');

      const wwValues = await this.iqaDataModel.getDistinctWW(fy || '');

      return {
        success: true,
        data: wwValues
      };
    } catch (error: any) {
      console.error('❌ Error getting distinct WW values:', error);

      return {
        success: false,
        error: error.message || 'Failed to get distinct WW values'
      };
    }
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create IQA Data Service
 */
export function createIQADataService(iqaDataModel: IQADataModel): IQADataService {
  return new IQADataService(iqaDataModel);
}

// ==================== DEFAULT EXPORT ====================

export default IQADataService;
