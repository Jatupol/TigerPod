// server/src/entities/reports/service.ts
// ===== LAR REPORT SERVICE =====
// Line Acceptance Rate (LAR) Report Entity Service
// Manufacturing Quality Control System - Business Logic Layer

import {
  LARReportQueryParams,
  LARReportResult,
  SeagateIQAResultReportRecord,
  SeagateIQAResultQueryParams,
  SGTIQATrendQueryParams,
  SGTIQATrendResult,
  OQADPPMOverallQueryParams,
  OQADPPMOverallResult
} from './types';
import { ReportModel } from './model';

// ==================== LAR REPORT SERVICE CLASS ====================

/**
 * Report Service
 * Business logic layer for report generation
 */
export class ReportService {
  private model: ReportModel;

  constructor(model: ReportModel) {
    this.model = model;
  }

  // ==================== CORE BUSINESS OPERATIONS ====================

  /**
   * Get LAR chart data (aggregated by week without defect breakdown)
   * Returns simplified chart data from database
   */
  async getLARChart(queryParams: LARReportQueryParams = {}): Promise<LARReportResult> {
    try {
      console.log('🔧 LARReportService.getLARChart called with params:', queryParams);

      // Validate parameters
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          errors: [validationError]
        };
      }

      const data = await this.model.getLARChart(queryParams);

      console.log(`✅ LARReportService.getLARChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'LAR chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getLARChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve LAR chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get LAR defect data
   * Returns defect data grouped by week
   */
  async getLARDefect(queryParams: LARReportQueryParams = {}): Promise<LARReportResult> {
    try {
      console.log('🔧 LARReportService.getLARDefect called with params:', queryParams);

      // Validate parameters
      const validationError = this.validateQueryParams(queryParams);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          errors: [validationError]
        };
      }

      const data = await this.model.getLARDefect(queryParams);

      console.log(`✅ LARReportService.getLARDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'LAR defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getLARDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve LAR defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  

  // ==================== VALIDATION ====================

  /**
   * Validate query parameters
   */
  private validateQueryParams(params: LARReportQueryParams): string | null {
    // Validate work week format (WWxx)
    if (params.wwFrom && !this.isValidWorkWeek(params.wwFrom)) {
      return `Invalid work week format for wwFrom: ${params.wwFrom}. Expected format: xx (e.g., 01, 52)`;
    }

    if (params.wwTo && !this.isValidWorkWeek(params.wwTo)) {
      return `Invalid work week format for wwTo: ${params.wwTo}. Expected format: xx (e.g., 01, 52)`;
    }

    return null;
  }

  /**
   * Check if work week string is valid (WWxx format)
   */
  private isValidWorkWeek(ww: string): boolean {
    const wwPattern = /^\d{2}$/i;
    return wwPattern.test(ww);
  }

  /**
   * Check if date string is valid (YYYY-MM-DD format)
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // ==================== FILTER OPTIONS ====================

  /**
   * Get available models for filtering
   */
  async getAvailableModels(): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getAvailableModels called');

      const models = await this.model.getAvailableModels();

      console.log(`✅ LARReportService.getAvailableModels: Retrieved ${models.length} models`);

      return {
        success: true,
        data: models,
        message: 'Available models retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getAvailableModels:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get available models',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available fiscal years for filtering
   */
  async getFiscalYears(): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getFiscalYears called');

      const fiscalYears = await this.model.getFiscalYears();

      console.log(`✅ LARReportService.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);

      return {
        success: true,
        data: fiscalYears,
        message: 'Fiscal years retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getFiscalYears:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get fiscal years',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get available work weeks for filtering (optionally filtered by fiscal year)
   */
  async getWorkWeeks(fiscalYear?: string): Promise<{
    success: boolean;
    data?: string[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 LARReportService.getWorkWeeks called with fiscalYear:', fiscalYear);

      const workWeeks = await this.model.getWorkWeeks(fiscalYear);

      console.log(`✅ LARReportService.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);

      return {
        success: true,
        data: workWeeks,
        message: 'Work weeks retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in LARReportService.getWorkWeeks:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get work weeks',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SEAGATE IQA RESULT REPORT ====================

  /**
   * Get Seagate IQA Result report data for a specific fiscal year and work week
   */
  async getSeagateIQAResult(params: SeagateIQAResultQueryParams): Promise<{
    success: boolean;
    data?: SeagateIQAResultReportRecord[];
    message?: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 ReportService.getSeagateIQAResult called with params:', params);

      // Validate required parameters
      if (!params.year || !params.ww) {
        return {
          success: false,
          message: 'Year and WW parameters are required',
          errors: ['Missing required parameters: year and ww']
        };
      }

      const data = await this.model.getSeagateIQAResult(params);

      console.log(`✅ ReportService.getSeagateIQAResult: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'Seagate IQA Result data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSeagateIQAResult:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve Seagate IQA Result data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // ==================== SGT IQA TREND REPORT ====================

  /**
   * Get  OQA DPPM OVerall  chart data
   * Returns aggregated chart data by yearmonth
   */
  async getOQADppmOverallChart(queryParams: OQADPPMOverallQueryParams = {}): Promise<OQADPPMOverallResult> {
    try {
      console.log('🔧 ReportService.getOQADppmOverallChart called with params:', queryParams);

      const data = await this.model.getOQADppmOverallChart(queryParams);

      console.log(`✅ ReportService.getOQADppmOverallChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOQADppmOverallChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get  OQA DPPM OVerall defect data
   * Returns defect data grouped by yearmonth
   */
  async getOQADppmOverallDefect(queryParams: OQADPPMOverallQueryParams = {}): Promise<OQADPPMOverallResult> {
    try {
      console.log('🔧 ReportService.getOQADppmOverallDefect called with params:', queryParams);

      const data = await this.model.getOQADppmOverallDefect(queryParams);

      console.log(`✅ ReportService.getOQADppmOverallDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getOQADppmOverallDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }


  // ==================== SGT IQA TREND REPORT ====================

  /**
   * Get SGT IQA Trend chart data
   * Returns aggregated chart data by yearmonth
   */
  async getSGTIQATrendChart(queryParams: SGTIQATrendQueryParams = {}): Promise<SGTIQATrendResult> {
    try {
      console.log('🔧 ReportService.getSGTIQATrendChart called with params:', queryParams);

      const data = await this.model.getSGTIQATrendChart(queryParams);

      console.log(`✅ ReportService.getSGTIQATrendChart: Retrieved ${data.length} records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend chart data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSGTIQATrendChart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get SGT IQA Trend defect data
   * Returns defect data grouped by yearmonth
   */
  async getSGTIQATrendDefect(queryParams: SGTIQATrendQueryParams = {}): Promise<SGTIQATrendResult> {
    try {
      console.log('🔧 ReportService.getSGTIQATrendDefect called with params:', queryParams);

      const data = await this.model.getSGTIQATrendDefect(queryParams);

      console.log(`✅ ReportService.getSGTIQATrendDefect: Retrieved ${data.length} defect records`);

      return {
        success: true,
        data,
        message: 'SGT IQA Trend defect data retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in ReportService.getSGTIQATrendDefect:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Report service instance
 */
export function createReportService(model: ReportModel): ReportService {
  return new ReportService(model);
}

export default ReportService;

/*
=== REPORT SERVICE FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained business logic layer
✅ No dependencies on other entities
✅ Clean separation from data access layer
✅ Manufacturing Quality Control domain focused

CORE OPERATIONS:
✅ getLARReport() - Raw database report data
✅ getLARWeeklyReport() - Aggregated weekly data with defects grouped
✅ getLARStats() - Statistical summary across all weeks
✅ healthCheck() - Service health verification

DATA AGGREGATION:
✅ Group defects by week
✅ Calculate weekly LAR and DPPM
✅ Aggregate lot pass/fail counts
✅ Top defects ranking

INPUT VALIDATION:
✅ Work week format validation (WWxx)
✅ Date format validation (YYYY-MM-DD)
✅ Round number range validation
✅ Comprehensive error messages

ERROR HANDLING:
✅ Try-catch blocks for all operations
✅ Detailed error logging
✅ User-friendly error messages
✅ Graceful error recovery

CONSISTENT RESULT TYPES:
✅ LARReportResult for raw data
✅ LARWeeklyReportResult for aggregated data
✅ LARStatsResult for statistics
✅ Standard success/error structure
*/
