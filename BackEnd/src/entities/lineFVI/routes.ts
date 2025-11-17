// server/src/entities/lineFVI/routes.ts
/**
 * FIXED: LineFvi Entity Routes - Auto-Discovery Compatible
 * Sampling Inspection Control System - VARCHAR CODE Pattern
 * 
 * ✅ FIXED: Exports router directly for auto-discovery compatibility
 * ✅ Uses default export function that returns router
 * ✅ Compatible with EntityAutoDiscovery factory patterns
 * ✅ Maintains complete VARCHAR CODE pattern functionality
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import {
  createVarcharCodeRoutes
} from '../../generic/entities/varchar-code-entity/generic-routes';

import {
  LineFvi,
  LineFviEntityConfig
} from './types';

import { LineFviController } from './controller';
import { LineFviService } from './service';
import { LineFviModel } from './model';

// Import FIXED core middleware
import {
  requireAuthentication,
  requireAdmin,
  requireManager,
  requireUser,
  validateVarcharCode,
  requestTracking
} from '../../middleware/auth';

// ==================== LINEFVI ROUTES FACTORY ====================

/**
 * ✅ FIXED: Proper factory pattern - accepts controller as parameter
 * This follows the same pattern as other entity route factories
 */
export function createLineFviRoutesWithController(controller: LineFviController): Router {
  const lineFviRoutes = new LineFviRoutes(controller);
  return lineFviRoutes.getRouter();
}

/**
 * ✅ FIXED: Default export compatible with auto-discovery
 * This creates the full entity stack and returns just the router
 */
export default function(db: Pool): Router {
  // Create the entity stack
  const lineFviModel = new LineFviModel(db);
  const lineFviService = new LineFviService(lineFviModel);
  const lineFviController = new LineFviController(lineFviService);

  // Use the proper factory function
  return createLineFviRoutesWithController(lineFviController);
}

// ==================== LINEFVI ROUTES CLASS ====================

/**
 * LineFvi Routes Class - Express routing for LineFvi entity
 * ✅ Uses composition approach with generic VARCHAR CODE factory functions
 * ✅ All route handlers use standard Express Request type
 */
export class LineFviRoutes {
  
  private router: Router;
  private controller: LineFviController;

  constructor(controller: LineFviController) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  /**
   * Get the configured router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Setup all routes using composition approach
   */
  private setupRoutes(): void {
    // First, setup generic VARCHAR CODE routes using factory function
    this.setupGenericRoutes();
    
    // Then, add LineFvi specific routes
    this.setupLineFviSpecificRoutes();
  }

  /**
   * Setup generic VARCHAR CODE routes using factory function
   * This gives us all the standard CRUD operations with code: string primary key
   */
  private setupGenericRoutes(): void {
    const genericRouter = createVarcharCodeRoutes<LineFvi>(this.controller, LineFviEntityConfig);
    this.router.use('/', genericRouter);
  }

  /**
   * Setup LineFvi specific routes in addition to generic routes
   */
  private setupLineFviSpecificRoutes(): void {
    this.router.use(requestTracking);

 

    /**
     * GET /api/line-fvi/statistics
     * Get LineFvi line statistics for manufacturing dashboard
     */
    this.router.get('/statistics',
      requireAuthentication,
      requireManager,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.getStatistics(req as any, res, next);
      }
    );

    /**
     * POST /api/line-fvi/check-code
     * Check if a line code is available
     */
    this.router.post('/check-code',
      requireAuthentication,
      requireUser,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.checkCodeAvailability(req as any, res, next);
      }
    );

    /**
     * GET /api/line-fvi/search/name/:pattern
     * Search LineFvi lines by name pattern
     */
    this.router.get('/search/name/:pattern',
      requireAuthentication,
      requireUser,
      this.validateSearchPattern,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.search(req as any, res, next);
      }
    );

    /**
     * GET /api/line-fvi/:code/operational-status
     * Check if LineFvi line is operational for production use
     */
    this.router.get('/:code/operational-status',
      requireAuthentication,
      requireUser,
      validateVarcharCode,
      (req: Request, res: Response, next: NextFunction) => {
        this.controller.checkOperationalStatus(req as any, res, next);
      }
    );

 
  }

  // ==================== VALIDATION MIDDLEWARE ====================

  /**
   * Validate search pattern parameter
   */
  private validateSearchPattern = (req: Request, res: Response, next: NextFunction): void => {
    const { pattern } = req.params;

    if (!pattern || pattern.length < 2 || pattern.length > 50) {
      res.status(400).json({
        success: false,
        message: 'Search pattern must be between 2 and 50 characters'
      });
      return;
    }

    next();
  };
}

// ==================== ADDITIONAL FACTORY FUNCTIONS ====================

/**
 * Factory function to create LineFvi routes with dependency injection
 */
export function createLineFviRoutes(db: Pool): Router {
  const lineFviModel = new LineFviModel(db);
  const lineFviService = new LineFviService(lineFviModel);
  const lineFviController = new LineFviController(lineFviService);
  
  return createLineFviRoutesWithController(lineFviController);
}

/**
 * Alternative factory using generic pattern only
 */
export function createLineFviRoutesGeneric(controller: LineFviController): Router {
  return createVarcharCodeRoutes<LineFvi>(controller, LineFviEntityConfig);
}

/**
 * Factory function to create LineFvi routes with custom role configuration
 */
export function createLineFviRoutesWithCustomRoles(
  controller: LineFviController,
  roleConfig?: {
    create?: typeof requireManager | typeof requireAdmin;
    read?: typeof requireUser | typeof requireManager | typeof requireAdmin;
    update?: typeof requireManager | typeof requireAdmin;
    delete?: typeof requireAdmin;
    statistics?: typeof requireManager | typeof requireAdmin;
    maintenance?: typeof requireManager | typeof requireAdmin;
    validation?: typeof requireManager | typeof requireAdmin;
  }
): Router {
  const router = Router();
  
  router.use(requestTracking);

  const roles = {
    create: roleConfig?.create || requireManager,
    read: roleConfig?.read || requireUser,
    update: roleConfig?.update || requireManager,
    delete: roleConfig?.delete || requireAdmin,
    statistics: roleConfig?.statistics || requireManager,
    maintenance: roleConfig?.maintenance || requireManager,
    validation: roleConfig?.validation || requireManager
  };

  // Standard CRUD routes with custom roles
  router.post('/', 
    requireAuthentication, 
    roles.create, 
    (req: Request, res: Response, next: NextFunction) => {
      controller.create(req as any, res, next);
    }
  );

  router.get('/', 
    requireAuthentication, 
    roles.read, 
    (req: Request, res: Response, next: NextFunction) => {
      controller.getAll(req as any, res, next);
    }
  );

  router.get('/:code', 
    requireAuthentication, 
    roles.read, 
    validateVarcharCode,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getByCode(req as any, res, next);
    }
  );

  router.put('/:code', 
    requireAuthentication, 
    roles.update, 
    validateVarcharCode,
    (req: Request, res: Response, next: NextFunction) => {
      controller.update(req as any, res, next);
    }
  );

  router.delete('/:code', 
    requireAuthentication, 
    roles.delete, 
    validateVarcharCode,
    (req: Request, res: Response, next: NextFunction) => {
      controller.delete(req as any, res, next);
    }
  );

  // LineFvi specific routes with custom roles
  router.get('/statistics', 
    requireAuthentication, 
    roles.statistics,
    (req: Request, res: Response, next: NextFunction) => {
      controller.getStatistics(req as any, res, next);
    }
  );

 

  return router;
}

/**
 * Complete entity factory function (backward compatibility)
 * Returns full entity stack for complex setups
 */
export function createLineFviEntity(db: Pool): {
  model: LineFviModel;
  service: LineFviService;
  controller: LineFviController;
  routes: Router;
} {
  const model = new LineFviModel(db);
  const service = new LineFviService(model);
  const controller = new LineFviController(service);
  const routes = new LineFviRoutes(controller);

  return {
    model,
    service,
    controller,
    routes: routes.getRouter()
  };
}
 