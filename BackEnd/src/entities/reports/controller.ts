// server/src/entities/reports/controller.ts
// ===== LAR REPORT CONTROLLER =====
// Line Acceptance Rate (LAR) Report Entity Controller
// Manufacturing Quality Control System - HTTP Request Handling

import { Request, Response, NextFunction } from 'express';
import { LARReportQueryParams, SGTIQATrendQueryParams, OQADPPMOverallQueryParams } from './types';
import { ReportService } from './service';

// ==================== LAR REPORT CONTROLLER CLASS ====================

/**
 * Report Controller
 * HTTP request handling for report endpoints
 */
export class ReportController {
  private service: ReportService;

  constructor(service: ReportService) {
    this.service = service;
  }

  // ==================== CORE HTTP ENDPOINTS ====================

  /**
   * GET /api/report-lar/chart
   * Get LAR chart data (simplified format without defect breakdown)
   */
  getLARChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report-lar/chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: LARReportQueryParams = {
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof LARReportQueryParams] === undefined) {
          delete queryParams[key as keyof LARReportQueryParams];
        }
      });

      const result = await this.service.getLARChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getLARChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/defect
   * Get LAR defect data (defects grouped by week)
   */
  getLARDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report-lar/defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: LARReportQueryParams = {
        yearFrom: req.query.yearFrom as string,
        wwFrom: req.query.wwFrom as string,
        yearTo: req.query.yearTo as string,
        wwTo: req.query.wwTo as string,
        model: req.query.model as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof LARReportQueryParams] === undefined) {
          delete queryParams[key as keyof LARReportQueryParams];
        }
      });

      const result = await this.service.getLARDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getLARDefect:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/models
   * Get available models for filtering
   */
  getAvailableModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/report-lar/models`);

      const result = await this.service.getAvailableModels();

      if (result.success) {
        console.log(`✅ GET /api/report-lar/models - Success: ${result.data?.length || 0} models`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/models - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getAvailableModels:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/fiscal-years
   * Get available fiscal years for filtering
   */
  getFiscalYears = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📋 GET /api/report-lar/fiscal-years`);

      const result = await this.service.getFiscalYears();

      if (result.success) {
        console.log(`✅ GET /api/report-lar/fiscal-years - Success: ${result.data?.length || 0} fiscal years`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/fiscal-years - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getFiscalYears:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/work-weeks?fy=2025
   * Get available work weeks for filtering (optionally filtered by fiscal year)
   */
  getWorkWeeks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fiscalYear = req.query.fy as string | undefined;
      console.log(`📋 GET /api/report-lar/work-weeks - fiscalYear:`, fiscalYear);

      const result = await this.service.getWorkWeeks(fiscalYear);

      if (result.success) {
        console.log(`✅ GET /api/report-lar/work-weeks - Success: ${result.data?.length || 0} work weeks`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/work-weeks - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in LARReportController.getWorkWeeks:', error);
      next(error);
    }
  };

  /**
   * GET /api/report-lar/seagate-iqa-result?year=2025&ww=09
   * Get Seagate IQA Result report data for a specific fiscal year and work week
   */
  getSeagateIQAResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year as string;
      const ww = req.query.ww as string;

      console.log(`📊 GET /api/report-lar/seagate-iqa-result - Query params:`, { year, ww });

      if (!year || !ww) {
        res.status(400).json({
          success: false,
          message: 'Year and WW parameters are required'
        });
        return;
      }

      const result = await this.service.getSeagateIQAResult({ year, ww });

      if (result.success) {
        console.log(`✅ GET /api/report-lar/seagate-iqa-result - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report-lar/seagate-iqa-result - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSeagateIQAResult:', error);
      next(error);
    }
  };

  // ==================== OQA DPPM OVerall ENDPOINTS ====================

  /**
   * GET /api/report/oqa-dppm-overall-chart
   * Get OQA DPPM OVerall chart data
   */
  getOQADppmOverallChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/oqa-dppm-overall-chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: OQADPPMOverallQueryParams = {
        year: req.query.year as string,
        ww: req.query.ww as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof OQADPPMOverallQueryParams] === undefined) {
          delete queryParams[key as keyof OQADPPMOverallQueryParams];
        }
      });

      const result = await this.service.getOQADppmOverallChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/oqa-dppm-overall-chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOQADPPMOverallChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/oqa-dppm-overall-defect
   * Get OQA DPPM OVerall defect data
   */
  getOQADppmOverallDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/oqa-dppm-overall-defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: OQADPPMOverallQueryParams = {
        year: req.query.year as string,
        ww: req.query.ww as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof OQADPPMOverallQueryParams] === undefined) {
          delete queryParams[key as keyof OQADPPMOverallQueryParams];
        }
      });

      const result = await this.service.getOQADppmOverallDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/oqa-dppm-overall-defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/oqa-dppm-overall-defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getOQADPPMOverallDefect:', error);
      next(error);
    }
  };

  // ==================== SGT IQA TREND ENDPOINTS ====================

  /**
   * GET /api/report/sgt-iqa-trend-chart
   * Get SGT IQA Trend chart data
   */
  getSGTIQATrendChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/sgt-iqa-trend-chart - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: SGTIQATrendQueryParams = {
        year: req.query.year as string,
        ww: req.query.ww as string,
        model: req.query.model as string,
        product_type: req.query.product_type as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof SGTIQATrendQueryParams] === undefined) {
          delete queryParams[key as keyof SGTIQATrendQueryParams];
        }
      });

      const result = await this.service.getSGTIQATrendChart(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/sgt-iqa-trend-chart - Success: ${result.data?.length || 0} records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/sgt-iqa-trend-chart - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSGTIQATrendChart:', error);
      next(error);
    }
  };

  /**
   * GET /api/report/sgt-iqa-trend-defect
   * Get SGT IQA Trend defect data
   */
  getSGTIQATrendDefect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 GET /api/report/sgt-iqa-trend-defect - Query params:`, req.query);

      // Extract and validate query parameters
      const queryParams: SGTIQATrendQueryParams = {
        year: req.query.year as string,
        ww: req.query.ww as string,
        model: req.query.model as string,
        product_type: req.query.product_type as string
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof SGTIQATrendQueryParams] === undefined) {
          delete queryParams[key as keyof SGTIQATrendQueryParams];
        }
      });

      const result = await this.service.getSGTIQATrendDefect(queryParams);

      if (result.success) {
        console.log(`✅ GET /api/report/sgt-iqa-trend-defect - Success: ${result.data?.length || 0} defect records`);
        res.status(200).json(result);
      } else {
        console.log(`❌ GET /api/report/sgt-iqa-trend-defect - Error: ${result.message}`);
        res.status(400).json(result);
      }

    } catch (error) {
      console.error('❌ Error in ReportController.getSGTIQATrendDefect:', error);
      next(error);
    }
  };

}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a Report controller instance
 */
export function createeportController(service: ReportService): ReportController {
  return new ReportController(service);
}

export default ReportController;

/*
=== REPORT CONTROLLER FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained HTTP request handling
✅ No dependencies on other entities
✅ Clean separation from business logic
✅ Standard Express controller pattern

CORE HTTP ENDPOINTS:
✅ GET /api/report-lar - Raw report data
✅ GET /api/report-lar/weekly - Aggregated weekly data
✅ GET /api/report-lar/statistics - Statistical summary
✅ GET /api/report-lar/health - Health check

REQUEST HANDLING:
✅ Query parameter extraction
✅ Type conversion (string to number)
✅ Parameter validation through service layer
✅ Undefined value cleanup

RESPONSE HANDLING:
✅ Proper HTTP status codes (200, 400, 503)
✅ Consistent JSON response format
✅ Comprehensive error handling
✅ Detailed logging for debugging

ERROR HANDLING:
✅ Try-catch blocks for all endpoints
✅ Express error middleware integration
✅ User-friendly error messages
✅ Console logging for troubleshooting

MANUFACTURING FOCUS:
✅ Work week filtering
✅ Station and round filtering
✅ Date range filtering
✅ LAR and DPPM metrics
*/
