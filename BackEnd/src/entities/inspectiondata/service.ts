// server/src/entities/inspectiondata/service.ts
/**
 * SIMPLIFIED: InspectionData Entity Service - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import ISpecialService,{
  GenericSpecialService 
} from '../../generic/entities/special-entity/generic-service';

import {
  calculateFiscalWeekNumber,
  getFiscalYear
} from '../../utils/fiscalWeek';


import {
  InspectionData,
  CreateInspectionDataRequest,
  UpdateInspectionDataRequest,
  InspectionDataServiceResult,
  InspectionDataListResult,
  INSPECTIONDATA_ENTITY_CONFIG
} from './types';

import { InspectionDataModel } from './model';

// ==================== SIMPLE INSPECTIONDATA SERVICE CLASS ====================

/**
 * Simple InspectionData Entity Service - extends GenericSpecialService for basic business logic
 */
export class InspectionDataService extends GenericSpecialService<InspectionData> implements ISpecialService<InspectionData> {

  protected inspectionDataModel: InspectionDataModel;

  constructor(model: InspectionDataModel) {
    super(model, INSPECTIONDATA_ENTITY_CONFIG);
    this.inspectionDataModel = model;
  }

  // ==================== REQUIRED ISPECIALSERVICE METHODS ====================

  /**
   * Get all inspection data with optional search and pagination (includes defects)
   */
  async getAll(searchTerm?: string, options?: { page?: number; limit?: number; station?: string }): Promise<InspectionDataServiceResult<InspectionData[]>> {
    try {
      // Default values
      const page = options?.page && options.page > 0 ? options.page : 1;
      const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

      console.log('🔧 InspectionDataService.getAll called',
        searchTerm ? `with search: "${searchTerm}"` : '',
        `page=${page}, limit=${limit}`,
        options?.station ? `station=${options.station}` : ''
      );

      // Get paginated data
      const data = await this.inspectionDataModel.getAllWithDefects(searchTerm, options);

      // Get total count for pagination info
      const totalCount = await this.inspectionDataModel.getCount(searchTerm, options?.station);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: data,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error: any) {
      console.error('❌ Error getting all inspection data:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve inspection data'
      };
    }
  }

  /**
   * Get all customer inspection data with optional search
   * Queries inspectiondata_customer table
   */
  async getAllCustomer(searchTerm?: string, options?: { page?: number; limit?: number; station?: string }): Promise<InspectionDataServiceResult<InspectionData[]>> {
    try {
      // Default values
      const page = options?.page && options.page > 0 ? options.page : 1;
      const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
      // Get paginated data
      const data = await this.inspectionDataModel.getAllWithDefectsCustomer(searchTerm, options);

      // Get total count for pagination info
      const totalCount = await this.inspectionDataModel.getCountCustomer(searchTerm, options?.station);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        data: data,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error: any) {
      console.error('❌ Error getting all inspection data:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve inspection data'
      };
    }
  }

  /**
   * Get inspection data by id
   */
  async getByKey(keyValues: Record<string, any>): Promise<InspectionDataServiceResult<InspectionData>> {
    try {
      const { id } = keyValues;

      console.log('🔧 InspectionDataService.getByKey called:', { id });

      if (!id) {
        return {
          success: false,
          message: 'ID is required' 
        };
      }

      const data = await this.inspectionDataModel.getByKey({ id });

      if (data) {
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          message: 'Inspection data not found' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error getting inspection data by key:', error);

      return {
        success: false,
        message: error.message || 'Failed to retrieve inspection data' 
      };
    }
  }

  /**
   * Create new inspection data
   */
  async create(data: CreateInspectionDataRequest, userId: number = 0): Promise<InspectionDataServiceResult<InspectionData>> {
    try {
      console.log('🔧 InspectionDataService.create called:', { inspection_no: data.inspection_no, station: data.station, userId });

      // Basic validation (skips certain fields for SIV)
      const validation = this.validateCreateData(data);
      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return {
          success: false,
          message: `Validation failed: ${validation.errors.join(', ')}` 
        };
      }

      // Calculate sampling round if not provided
      let samplingRound = data.round;
      if (!samplingRound && data.station && data.lotno) {
        samplingRound = await this.calculateSamplingRound(data.station, data.lotno);
        console.log(`🔢 Calculated sampling round for station=${data.station}, lotno=${data.lotno}: ${samplingRound}`);
      }

      // Add audit fields and calculated round
      const createData = {
        ...data,
        round: samplingRound || 0,
        created_by: userId,
        updated_by: userId
      };

      const result = await this.inspectionDataModel.create(createData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Inspection data created successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to create inspection data' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating inspection data:', error);

      return {
        success: false,
        message: error.message || 'Failed to create inspection data' 
      };
    }
  }

  /**
   * Calculate the next sampling round number based on existing records
   * Groups by station and lotno, then counts distinct groups
   */
  private async calculateSamplingRound(station: string, lotno: string): Promise<number> {
    try {
      const result = await this.inspectionDataModel.getSamplingRoundCount(station, lotno);
      return result + 1; // Next round is current count + 1
    } catch (error: any) {
      console.error('❌ Error calculating sampling round:', error);
      return 1; // Default to round 1 if error occurs
    }
  }

  /**
   * Public method to get sampling round count
   * Exposes model method for controller access
   */
  async getSamplingRoundCount(station: string, lotno: string): Promise<number> {
    try {
      return await this.inspectionDataModel.getSamplingRoundCount(station, lotno);
    } catch (error: any) {
      console.error('❌ Error getting sampling round count:', error);
      throw error;
    }
  }

  /**
   * Public method to generate inspection number
   * Exposes model method for controller access
   */
  async generateInspectionNumber(station: string, inspectionDate: Date, ww: string): Promise<string> {
    try {
      return await this.inspectionDataModel.generateInspectionNumber(station, inspectionDate, ww);
    } catch (error: any) {
      console.error('❌ Error generating inspection number:', error);
      throw error;
    }
  }

 
  /**
   * Create SIV inspection record from OQA inspection
   * Copies: inspection_no -> inspection_no_ref, station='SIV', partsite, itemno, model, version, mclineno, lotno
   *
   * SIV Inspection Number Format: SIV + YY + MM + WW + - + DD + RunningNumber(4 digit)
   * Round calculation: Count by LOT No in station 'SIV'
   */
  async createSIVFromOQA(oqaInspectionId: number, userId: number = 0): Promise<InspectionDataServiceResult<InspectionData>> {
    try {
      console.log('🔧 Creating SIV inspection from OQA inspection:', oqaInspectionId);

      // Get the OQA inspection data
      const oqaResult = await this.getByKey({ id: oqaInspectionId });

      if (!oqaResult.success || !oqaResult.data) {
        return {
          success: false,
          message: `Inspection not found for ID: ${oqaInspectionId}` 
        };
      }

      const oqaInspection = oqaResult.data;
      const currentDate = new Date();

      // Generate WW number for current date using fiscal week calculation
      const wwNumber =  calculateFiscalWeekNumber(currentDate);
      const fy =  getFiscalYear(currentDate);

      // Generate new inspection number for SIV with format: SIV+YY+MM+WW+-+DD+RunningNumber(4 digit)
      const sivInspectionNo = await this.inspectionDataModel.generateInspectionNumber(
        'SIV',
        currentDate,
        wwNumber.toString()
      );

      console.log('📋 Generated SIV inspection number:', sivInspectionNo);

      // Calculate sampling round for SIV station based on LOT No
      // Round = Count of existing SIV inspections for this lotno + 1
      const sivRound = await this.calculateSamplingRound('SIV', oqaInspection.lotno);
      console.log(`🔢 Calculated SIV round for lotno ${oqaInspection.lotno}: ${sivRound}`);

      // Create month_year in YYYY-MM format
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const monthYear = `${year}-${month}`;

      // Create SIV inspection data
      // Note: shift, fvilineno, qc_id, general_sampling_qty, crack_sampling_qty, judgment, grps, zones
      // are not required for SIV records - use empty/default values
      const sivData: CreateInspectionDataRequest = {
        station: 'SIV',
        inspection_no: sivInspectionNo,
        inspection_no_ref: oqaInspection.inspection_no, // Reference to original OQA inspection
        inspection_date: currentDate,
        fy: fy.toString(), // Fiscal week number
        ww: wwNumber.toString(), // Fiscal week number
        month_year: monthYear,
        shift: '-', // Not required for SIV - use placeholder
        lotno: oqaInspection.lotno,
        partsite: oqaInspection.partsite,
        itemno: oqaInspection.itemno,
        model: oqaInspection.model,
        version: oqaInspection.version,
        mclineno: oqaInspection.mclineno,
        fvilineno: '-', // Not required for SIV - use placeholder
        sampling_reason_id: oqaInspection.sampling_reason_id, // Copy from OQA inspection
        round: sivRound, // Calculated based on lotno count in SIV station
        qc_id: 0, // Not required for SIV - use default
        fvi_lot_qty: oqaInspection.fvi_lot_qty,
        general_sampling_qty: 0, // Not required for SIV - use default
        crack_sampling_qty: 0 // Not required for SIV - use default
        // judgment is omitted - will default to NULL and be updated by SIV team
      };

      console.log('📝 Creating SIV inspection with data:', sivData);

      // Create the SIV inspection
      const result = await this.create(sivData, userId);
      
     //update fivi to default value
     const result2 = await this.inspectionDataModel.updateFviToDefault(sivInspectionNo)

      if (result.success) {
        console.log('✅ SIV inspection created successfully:', result.data?.id);
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error creating SIV inspection from OQA:', error);
      return {
        success: false,
        message: error.message || 'Failed to create SIV inspection' 
      };
    }
  }

  /**
   * Update inspection data by id
   */
  async update(keyValues: Record<string, any>, data: UpdateInspectionDataRequest, userId: number = 0): Promise<InspectionDataServiceResult<InspectionData>> {
    try {
      const { id } = keyValues;

      console.log('🔧 InspectionDataService.update called:', { id, userId });

      if (!id) {
        return {
          success: false,
          message: 'ID is required' 
        };
      }

      // Add audit fields
      const updateData = {
        ...data,
        updated_by: userId
      };

      const result = await this.inspectionDataModel.update({ id }, updateData, userId);

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: 'Inspection data updated successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to update inspection data' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error updating inspection data:', error);

      return {
        success: false,
        message: error.message || 'Failed to update inspection data' 
      };
    }
  }

  /**
   * Delete inspection data by id
   */
  async delete(keyValues: Record<string, any>): Promise<InspectionDataServiceResult<boolean>> {
    try {
      const { id } = keyValues;

      console.log('🔧 InspectionDataService.delete called:', { id });

      if (!id) {
        return {
          success: false,
          message: 'ID is required' 
        };
      }

      const result = await this.inspectionDataModel.delete({ id });

      if (result.success) {
        return {
          success: true,
          data: true,
          message: 'Inspection data deleted successfully'
        };
      } else {
        return {
          success: false,
          message: result.error || 'Failed to delete inspection data' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error deleting inspection data:', error);

      return {
        success: false,
        message: error.message || 'Failed to delete inspection data' 
      };
    }
  }

  /**
   * Check if inspection data exists by id
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    try {
      const { id } = keyValues;

      if (!id) {
        return false;
      }

      return await this.inspectionDataModel.exists({ id });
    } catch (error: any) {
      console.error('❌ Error checking inspection data existence:', error);
      return false;
    }
  }

  // ==================== DASHBOARD STATISTICS METHODS ====================

  /**
   * Get station-specific statistics for dashboard
   */
  async getStationStatistics(station: string): Promise<{
    total: number;
    this_year: number;
    this_month: number;
    this_week: number;
    today: number;
  }> {
    try {
      const result = await this.inspectionDataModel.getStationStatistics(station);
      return result;
    } catch (error) {
      console.error(`Error getting station statistics for ${station}:`, error);
      throw error;
    }
  }

  /**
   * Get weekly trend data for charts
   */
  async getWeeklyTrend(station: string): Promise<Array<{
    ww: string;
    total: number;
    pass: number;
    fail: number;
  }>> {
    try {
      const result = await this.inspectionDataModel.getWeeklyTrend(station);
      return result;
    } catch (error) {
      console.error(`Error getting weekly trend for ${station}:`, error);
      throw error;
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate create data
   * Note: For SIV station, skip validation for shift, fvilineno, qc_id, general_sampling_qty,
   * crack_sampling_qty, judgment as they are not required
   */
  private validateCreateData(data: CreateInspectionDataRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const isSIV = data.station?.toUpperCase() === 'SIV';

    // Required field validations
    if (!data.station?.trim()) {
      errors.push('Station is required');
    }

    if (!data.inspection_no?.trim()) {
      errors.push('Inspection number is required');
    }

    if (!data.month_year?.trim()) {
      errors.push('Month year is required');
    }

    // Skip shift validation for SIV
    if (!isSIV && !data.shift?.trim()) {
      errors.push('Shift is required');
    }

    if (!data.lotno?.trim()) {
      errors.push('Lot number is required');
    }

    // Optional fields - not required for import
    // if (!data.partsite?.trim()) {
    //   errors.push('Part site is required');
    // }

    // if (!data.mclineno?.trim()) {
    //   errors.push('Machine line number is required');
    // }

    // if (!data.itemno?.trim()) {
    //   errors.push('Item number is required');
    // }

    // if (!data.model?.trim()) {
    //   errors.push('Model is required');
    // }

    // if (!data.version?.trim()) {
    //   errors.push('Version is required');
    // }

    // Skip fvilineno validation for SIV
    if (!isSIV && !data.fvilineno?.trim()) {
      errors.push('FVI line number is required');
    }

    // Length validations
    if (data.station && data.station.length > 3) {
      errors.push('Station must be 3 characters or less');
    }

    if (data.inspection_no && data.inspection_no.length > 20) {
      errors.push('Inspection number must be 20 characters or less');
    }

    if (data.month_year && data.month_year.length > 20) {
      errors.push('Month year must be 20 characters or less');
    }

    if (data.shift && data.shift.length > 1) {
      errors.push('Shift must be 1 character');
    }

    if (data.lotno && data.lotno.length > 30) {
      errors.push('Lot number must be 30 characters or less');
    }

    if (data.partsite && data.partsite.length > 10) {
      errors.push('Part site must be 10 characters or less');
    }

    if (data.mclineno && data.mclineno.length > 5) {
      errors.push('Machine line number must be 5 characters or less');
    }

    if (data.itemno && data.itemno.length > 30) {
      errors.push('Item number must be 30 characters or less');
    }

    if (data.model && data.model.length > 100) {
      errors.push('Model must be 100 characters or less');
    }

    if (data.version && data.version.length > 100) {
      errors.push('Version must be 100 characters or less');
    }

    if (data.fvilineno && data.fvilineno.length > 5) {
      errors.push('FVI line number must be 5 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create InspectionData service instance
 */
export function createInspectionDataService(model: InspectionDataModel): InspectionDataService {
  return new InspectionDataService(model);
}

export default InspectionDataService;