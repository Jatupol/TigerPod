// server/src/entities/line-fvi/controller.ts

/**
 * LineFvi Entity Controller Implementation
 * 
 * This module implements the LineFvi controller following the VARCHAR CODE pattern.
 * LineFvi controller provides HTTP request/response handling for LineFvi entity.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericVarcharCodeController from VARCHAR CODE pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained LineFvi HTTP handling layer
 * ✅ 90% code reduction through generic pattern reuse
 * ✅ Integrates seamlessly with existing middleware (auth, validation, logging)
 * 
 * HTTP API Endpoints (inherited from generic):
 * - GET /api/line-fvi/:code - Get LineFvi by code
 * - GET /api/line-fvi - List LineFvi with pagination/filtering
 * - POST /api/line-fvi - Create new LineFvi
 * - PUT /api/line-fvi/:code - Update existing LineFvi
 * - DELETE /api/line-fvi/:code - Delete LineFvi
 * - PATCH /api/line-fvi/:code/status - Toggle active/inactive status
 * 
 * Additional LineFvi-specific endpoints:
 * - GET /api/line-fvi/active/selection - Get active lines for dropdowns
 * - GET /api/line-fvi/statistics - Get line statistics
 * - POST /api/line-fvi/check-code - Check code availability
 * - GET /api/line-fvi/search/name/:pattern - Search by name pattern
 */

import { Response, NextFunction } from 'express';
import {
  GenericVarcharCodeController,
  createGenericVarcharCodeController
} from '../../generic/entities/varchar-code-entity/generic-controller';

import {
  VarcharCodeEntityRequest,
  VarcharCodeApiResponse,
  IVarcharCodeController
} from '../../generic/entities/varchar-code-entity/generic-types';

import {
  LineFvi,
  LineFviEntityConfig,
  LineFviApiResponse
} from './types';

import { LineFviService } from './service';

// ==================== LINE FVI CONTROLLER CLASS ====================

/**
 * LineFvi Controller - HTTP request/response handling for LineFvi entity
 * 
 * Extends GenericVarcharCodeController to inherit all standard VARCHAR CODE endpoints:
 * ✅ create(req, res, next) - POST /api/line-fvi
 * ✅ getByCode(req, res, next) - GET /api/line-fvi/:code
 * ✅ update(req, res, next) - PUT /api/line-fvi/:code
 * ✅ delete(req, res, next) - DELETE /api/line-fvi/:code
 * ✅ changeStatus(req, res, next) - PATCH /api/line-fvi/:code/status
 * ✅ getAll(req, res, next) - GET /api/line-fvi
 * 
 * Plus LineFvi-specific endpoints for manufacturing operations.
 */
export class LineFviController extends GenericVarcharCodeController<LineFvi> implements IVarcharCodeController {
  
  protected service: LineFviService;

  constructor(service: LineFviService) {
    super(service, LineFviEntityConfig);
    this.service = service;
  }

  // ==================== LINEFVI-SPECIFIC ENDPOINTS ====================
  

  /**
   * POST /api/line-fvi/check-code
   * Check if LineFvi code is available for creation
   * Body: { code: string }
   * Returns availability status, validation reasons, and suggestions
   */
  checkCodeAvailability = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed by requireAuthentication middleware
      const userId = req.user!.id;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Code is required'
        });
        return;
      }

      const result = await this.service.checkCodeAvailability(code, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Code availability checked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to check code availability'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  

  /**
   * GET /api/line-fvi/:code/operational-status
   * Check if LineFvi line is operational for production use
   * Returns operational status with detailed reasons
   */
  checkOperationalStatus = async (req: VarcharCodeEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is guaranteed by requireAuthentication middleware
      // req.params.code is guaranteed valid by validateVarcharCode middleware
      const code = req.params.code;

      const result = await this.service.isLineOperational(code);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: 'Operational status checked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to check operational status'
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // Note: Response formatting is handled directly using Express res.json()
  // This maintains consistency with the API response format while avoiding private method access
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create LineFvi controller instance
 * Uses LineFvi-specific service with enhanced functionality
 */
export function createLineFviController(service: LineFviService): LineFviController {
  return new LineFviController(service);
}

/**
 * Alternative factory using generic pattern (for consistency)
 */
export function createLineFviControllerGeneric(service: LineFviService): IVarcharCodeController {
  return createGenericVarcharCodeController<LineFvi>(service, LineFviEntityConfig);
}

export default LineFviController;

 