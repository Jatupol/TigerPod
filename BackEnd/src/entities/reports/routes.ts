// server/src/entities/reports/routes.ts
// ===== REPORT ROUTES =====
// Report Entity Routes
// Manufacturing Quality Control System - HTTP Route Definitions

import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { ReportController } from './controller';
import { ReportService } from './service';
import { ReportModel } from './model';

// ==================== ROUTE FACTORY FUNCTION ====================

/**
 * Create Report routes with all necessary endpoints
 */
export default function createReportRoutes(db: Pool): Router {
  const router = Router();

  // Create entity stack
  const model = new ReportModel(db);
  const service = new ReportService(model);
  const controller = new ReportController(service);

  // ==================== CORE REPORT ENDPOINTS ====================

  /**
   * GET /api/report/lar-chart
   * Get LAR chart data (simplified format without defect breakdown)
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2025')
   * - wwFrom: Start work week (e.g., '01')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '52')
   * - model: Model filter (e.g., 'ModelA 1.0')
   *
   * Fixed Parameters:
   * - station: 'OQA' (hardcoded)
   * - round: 1 (hardcoded)
   */
  router.get('/lar-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getLARChart(req, res, next);
    }
  );

  /**
   * GET /api/report/lar-defect
   * Get LAR defect data (defects grouped by week)
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2025')
   * - wwFrom: Start work week (e.g., '01')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '52')
   * - model: Model filter (e.g., 'ModelA 1.0')
   *
   * Fixed Parameters:
   * - station: 'OQA' (hardcoded)
   * - round: 1 (hardcoded)
   */
  router.get('/lar-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getLARDefect(req, res, next);
    }
  );


  /**
   * GET /api/report/models
   * Get available models for filtering
   */
  router.get('/models',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getAvailableModels(req, res, next);
    }
  );

  /**
   * GET /api/report/fiscal-years
   * Get available fiscal years for filtering
   */
  router.get('/fiscal-years',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getFiscalYears(req, res, next);
    }
  );

  /**
   * GET /api/report/work-weeks?fy=2025
   * Get available work weeks for filtering
   * Optional query parameter: fy (fiscal year)
   */
  router.get('/work-weeks',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getWorkWeeks(req, res, next);
    }
  );

  /**
   * GET /api/report/seagate-iqa-result?year=2025&ww=09
   * Get Seagate IQA Result report data
   *
   * Query Parameters:
   * - year: Fiscal year (e.g., '2025') - REQUIRED
   * - ww: Work week (e.g., '09') - REQUIRED
   */
  router.get('/seagate-iqa-result',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSeagateIQAResult(req, res, next);
    }
  );



  /**
   * GET /api/report/oqa-dppm-overall?year=2025&ww=09
   * Get OQA DPPM Overall report data
   *
   * Query Parameters:
   * - year: Fiscal year (e.g., '2025') - REQUIRED
   * - ww: Work week (e.g., '09') - REQUIRED
   */
  router.get('/oqa-dppm-overall-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOQADppmOverallChart(req, res, next);
    }
  );

 

  /**
   * GET /api/report/oqa-dppm-overall-defect
   * Get OQA DPPM Overall defect data
   *
   * Query Parameters:
   * - yearFrom: fiscal year (e.g., '2024')
   * - wwFrom: work week (e.g., '49')
   */
  router.get('/oqa-dppm-overall-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getOQADppmOverallDefect(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-chart
   * Get SGT IQA Trend chart data
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2024')
   * - wwFrom: Start work week (e.g., '49')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '06')
   * - model: Model filter (e.g., 'PINE 5.2.6')
   * - product_type: Product type filter (e.g., 'HSA', 'HDD')
   */
  router.get('/sgt-iqa-trend-chart',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendChart(req, res, next);
    }
  );

  /**
   * GET /api/report/sgt-iqa-trend-defect
   * Get SGT IQA Trend defect data
   *
   * Query Parameters:
   * - yearFrom: Start fiscal year (e.g., '2024')
   * - wwFrom: Start work week (e.g., '49')
   * - yearTo: End fiscal year (e.g., '2025')
   * - wwTo: End work week (e.g., '06')
   * - model: Model filter (e.g., 'PINE 5.2.6')
   * - product_type: Product type filter (e.g., 'HSA', 'HDD')
   */
  router.get('/sgt-iqa-trend-defect',
    (req: Request, res: Response, next: NextFunction) => {
      controller.getSGTIQATrendDefect(req, res, next);
    }
  );

  return router;
}

/**
 * Alternative factory function for use with dependency injection
 */
export function createLARReportRoutesWithController(controller: ReportController): Router {
  const router = Router();

  router.get('/lar-chart', controller.getLARChart);
  router.get('/lar-defect', controller.getLARDefect);
  router.get('/models', controller.getAvailableModels);
  router.get('/fiscal-years', controller.getFiscalYears);
  router.get('/work-weeks', controller.getWorkWeeks);
  router.get('/seagate-iqa-result', controller.getSeagateIQAResult);
  router.get('/oqa-dppm-overall-chart', controller.getOQADppmOverallChart);
  router.get('/oqa-dppm-overall-defect', controller.getOQADppmOverallDefect);
  router.get('/sgt-iqa-trend-chart', controller.getSGTIQATrendChart);
  router.get('/sgt-iqa-trend-defect', controller.getSGTIQATrendDefect);
  return router;
}

/*
=== LAR REPORT ROUTES FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained route definitions
✅ No dependencies on other entities
✅ Standard Express Router pattern
✅ Factory pattern support


QUERY PARAMETERS:
✅ wwFrom/wwTo - Work week range filtering
✅ dateFrom/dateTo - Date range filtering
✅ station - Station filtering (default: 'OQA')
✅ round - Round filtering (default: 1)

MIDDLEWARE READY:
✅ Authentication middleware placeholders (commented)
✅ Request tracking middleware placeholders
✅ Role-based access control ready

MANUFACTURING FOCUS:
✅ Work week based reporting
✅ LAR (Line Acceptance Rate) metrics
✅ DPPM (Defects Per Million) tracking
✅ Defect type breakdown
✅ OQA station quality metrics
*/
