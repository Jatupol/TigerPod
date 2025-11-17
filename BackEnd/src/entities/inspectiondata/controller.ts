// server/src/entities/inspectiondata/controller.ts
/**
 * SIMPLIFIED: InspectionData Entity Controller - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import { Request, Response, NextFunction } from 'express';
import { GenericSpecialController } from '../../generic/entities/special-entity/generic-controller';
import {
  ISpecialController,
  SpecialEntityRequest
} from '../../generic/entities/special-entity/generic-types';

import {
  InspectionData,
  CreateInspectionDataRequest,
  UpdateInspectionDataRequest,
  InspectionDataEntityRequest,
  INSPECTIONDATA_ENTITY_CONFIG
} from './types';

import { InspectionDataService } from './service';

// ==================== SIMPLE INSPECTIONDATA CONTROLLER CLASS ====================

/**
 * Simple InspectionData Entity Controller - extends GenericSpecialController for HTTP handling
 */
export class InspectionDataController extends GenericSpecialController<InspectionData> implements ISpecialController {

  protected inspectionDataService: InspectionDataService;

  constructor(service: InspectionDataService) {
    super(service, INSPECTIONDATA_ENTITY_CONFIG);
    this.inspectionDataService = service;
  }

  // ==================== CUSTOM METHODS ====================

  /**
   * GET /api/inspectiondata/sampling-round?station=...&lotno=...
   * Get the next sampling round for a station and lotno combination
   */
  getNextSamplingRound = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station, lotno } = req.query;

      if (!station || !lotno) {
        res.status(400).json({
          success: false,
          message: 'Station and lotno are required',
          error: 'MISSING_PARAMETERS'
        });
        return;
      }

      console.log(`🔢 Getting next sampling round for station=${station}, lotno=${lotno}`);

      const currentRound = await this.inspectionDataService.getSamplingRoundCount(
        station as string,
        lotno as string
      );
      const nextRound = currentRound + 1;

      res.status(200).json({
        success: true,
        data: { nextRound, currentRound },
        message: 'Sampling round retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting sampling round:', error);
      next(error);
    }
  };

  /**
   * POST /api/inspectiondata/:id/create-siv
   * Create SIV inspection from OQA inspection
   */
  createSIVFromOQA = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      console.log(`🔧 Creating SIV from inspection ID: ${id} [User: ${userId}]`);
      console.log('📋 Request params:', req.params);
      console.log('📋 Request URL:', (req as any).url);

      // Validate ID
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Inspection ID is required',
          error: 'MISSING_ID'
        });
        return;
      }

      const inspectionId = parseInt(id, 10);

      if (isNaN(inspectionId)) {
        res.status(400).json({
          success: false,
          message: `Invalid inspection ID: ${id}`,
          error: 'INVALID_ID'
        });
        return;
      }

      console.log(`✅ Parsed inspection ID: ${inspectionId}`);

      const result = await this.inspectionDataService.createSIVFromOQA(inspectionId, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'SIV inspection created successfully from OQA'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to create SIV inspection'
        });
      }
    } catch (error) {
      console.error('❌ Error creating SIV from OQA:', error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/generate-inspection-number?station=...&date=...&ww=...
   * Generate the next inspection number with format: Station+YY+MM+WW+'-'+DD+RunningNumber4digit
   * Running number resets to 1 at the beginning of each day
   */
  generateInspectionNumber = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station, date, ww } = req.query;

      if (!station || !date || !ww) {
        res.status(400).json({
          success: false,
          message: 'Station, date, and ww are required',
          error: 'MISSING_PARAMETERS'
        });
        return;
      }

      console.log(`🔢 Generating inspection number for station=${station}, date=${date}, ww=${ww}`);

      const inspectionDate = new Date(date as string);
      const inspectionNo = await this.inspectionDataService.generateInspectionNumber(
        station as string,
        inspectionDate,
        ww as string
      );

      res.status(200).json({
        success: true,
        data: { inspectionNo },
        message: 'Inspection number generated successfully'
      });
    } catch (error) {
      console.error('❌ Error generating inspection number:', error);
      next(error);
    }
  };

  // ==================== REQUIRED ISPECIALCONTROLLER METHODS ====================

  /**
   * GET /api/inspectiondata?page=1&limit=20&station=OQA&search=...
   * Get all inspection data with optional search and pagination
   */
  getAll = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const searchTerm = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const station = req.query.station as string;

      console.log(`📋 Getting all inspection data [User: ${userId}]`,
        searchTerm ? `with search: "${searchTerm}"` : '',
        `page=${page}, limit=${limit}`,
        station ? `station=${station}` : ''
      );

      const result = await this.inspectionDataService.getAll(searchTerm, {
        page,
        limit,
        station
      });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          pagination: result.pagination,
          message: 'Inspection data retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to get inspection data',
          error: 'GET_ALL_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting all inspection data:', error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/customerdata
   * Get all customer inspection data with optional search
   * Queries inspectiondata_customer table
   */
  getAllCustomer = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const searchTerm = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const station = req.query.station as string;
 
      const result = await this.inspectionDataService.getAllCustomer(searchTerm, {
        page,
        limit,
        station
      });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          pagination: result.pagination,
          message: 'Inspection data retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to get inspection data',
          error: 'GET_ALL_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting all inspection data:', error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/:id
   * Get inspection data by id
   */
  getByKey = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      console.log(`📋 Getting inspection data by id: ${id} [User: ${userId}]`);

      const result = await this.inspectionDataService.getByKey({ id });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Inspection data retrieved successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message || 'Inspection data not found',
          error: 'INSPECTION_DATA_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error('❌ Error getting inspection data by key:', error);
      next(error);
    }
  };

  /**
   * POST /api/inspectiondata
   * Create new inspection data
   */
  create = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const createData = req.body as CreateInspectionDataRequest;

      console.log(`🔧 Creating inspection data:`, createData, `[User: ${userId}]`);

      const result = await this.inspectionDataService.create(createData, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: 'Inspection data created successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to create inspection data',
          error: 'CREATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error creating inspection data:', error);
      next(error);
    }
  };

  /**
   * PUT /api/inspectiondata/:id
   * Update inspection data by id
   */
  update = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updateData = req.body as UpdateInspectionDataRequest;

      console.log(`🔧 Updating inspection data: ${id}`, updateData, `[User: ${userId}]`);

      const result = await this.inspectionDataService.update({ id }, updateData, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Inspection data updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to update inspection data',
          error: 'UPDATE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error updating inspection data:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/inspectiondata/:id
   * Delete inspection data by id
   */
  delete = async (req: SpecialEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      console.log(`🗑️ Deleting inspection data: ${id} [User: ${userId}]`);

      const result = await this.inspectionDataService.delete({ id });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Inspection data deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to delete inspection data',
          error: 'DELETE_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error deleting inspection data:', error);
      next(error);
    }
  };

  // ==================== ADDITIONAL UTILITY METHODS ====================

  /**
   * GET /api/inspectiondata/health
   * Health check endpoint
   */
  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        message: 'InspectionData service is healthy',
        timestamp: new Date().toISOString(),
        service: 'inspectiondata'
      });
    } catch (error) {
      console.error('❌ Error in inspectiondata health check:', error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/statistics
   * Get basic inspectiondata statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user!.id;

      console.log(`📊 Getting inspectiondata statistics [User: ${userId}]`);

      // Get all inspection data for basic statistics
      const result = await this.inspectionDataService.getAll();

      if (result.success && result.data) {
        const inspectionData = result.data;
        const statistics = {
          total: inspectionData.length,
          active: inspectionData.filter(i => i.is_active).length,
          inactive: inspectionData.filter(i => !i.is_active).length,
          byStation: this.groupByField(inspectionData, 'station'),
          byShift: this.groupByField(inspectionData, 'shift'),
          byModel: this.groupByField(inspectionData, 'model')
        };

        res.status(200).json({
          success: true,
          data: statistics,
          message: 'InspectionData statistics retrieved successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to get inspectiondata statistics',
          error: 'STATISTICS_FAILED'
        });
      }
    } catch (error) {
      console.error('❌ Error getting inspectiondata statistics:', error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/stats/:station
   * Get station-specific statistics for dashboard
   */
  getStationStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station } = req.params;
      console.log(`📊 Getting station stats for: ${station}`);

      const stats = await this.inspectionDataService.getStationStatistics(station);

      res.status(200).json({
        success: true,
        data: stats,
        message: `Statistics for ${station} retrieved successfully`
      });
    } catch (error) {
      console.error(`❌ Error getting station stats for ${req.params.station}:`, error);
      next(error);
    }
  };

  /**
   * GET /api/inspectiondata/weekly-trend/:station
   * Get weekly trend data for charts
   */
  getWeeklyTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { station } = req.params;
      console.log(`📈 Getting weekly trend for: ${station}`);

      const trendData = await this.inspectionDataService.getWeeklyTrend(station);

      res.status(200).json({
        success: true,
        data: trendData,
        message: `Weekly trend for ${station} retrieved successfully`
      });
    } catch (error) {
      console.error(`❌ Error getting weekly trend for ${req.params.station}:`, error);
      next(error);
    }
  };

  // ==================== HELPER METHODS ====================

  /**
   * Group inspection data by a specific field for statistics
   */
  private groupByField(inspectionData: InspectionData[], field: keyof InspectionData): Array<{ key: string; count: number }> {
    const groups = inspectionData.reduce((acc, item) => {
      const key = String(item[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groups)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create InspectionData controller instance
 */
export function createInspectionDataController(service: InspectionDataService): InspectionDataController {
  return new InspectionDataController(service);
}

export default InspectionDataController;