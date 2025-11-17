// server/src/entities/defect-customer-image/controller.ts
/**
 * Defect Image Entity Controller
 * Complete Separation Entity Architecture
 */

import { Request, Response, NextFunction } from 'express';
import { DefectImageService } from './service';

/**
 * Defect Image Controller - HTTP handling layer
 */
export class DefectImageController {
  private service: DefectImageService;

  constructor(service: DefectImageService) {
    this.service = service;
  }

  /**
   * Extract user ID from request session
   */
  private extractUserId(req: Request): number | undefined {
    return req.session?.user?.id;
  }

  /**
   * POST /api/defect-customer-image
   * Create a single defect image
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id } = req.body;
      const userId = this.extractUserId(req);

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const result = await this.service.create({
        defect_id: parseInt(defect_id),
        imge_data: req.file.buffer
      }, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data?.id,
          defect_id: result.data?.defect_id
        },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.create:', error);
      next(error);
    }
  };

  /**
   * POST /api/defect-customer-image/bulk
   * Create multiple defect images for a single defect
   */
  bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id } = req.body;
      const userId = this.extractUserId(req);

      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
        return;
      }

      const imageBuffers = req.files.map(file => file.buffer);

      const result = await this.service.bulkCreate(
        parseInt(defect_id),
        imageBuffers,
        userId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data?.map(img => ({
          id: img.id,
          defect_id: img.defect_id
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.bulkCreate:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-customer-image/:id
   * Get image by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = this.extractUserId(req);

      const result = await this.service.getById(id, userId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error
        });
        return;
      }

      // Return image as binary data
      res.set('Content-Type', 'image/jpeg');
      res.send(result.data?.imge_data);

    } catch (error) {
      console.error('Error in DefectImageController.getById:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-customer-image/defect/:defectId
   * Get all images for a defect
   */
  getByDefectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defectId = parseInt(req.params.defectId);
      const userId = this.extractUserId(req);

      const result = await this.service.getByDefectId(defectId, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      // Return metadata only (not the binary data)
      res.status(200).json({
        success: true,
        data: result.data?.map(img => ({
          id: img.id,
          defect_id: img.defect_id,
          image_url: `/api/defect-customer-image/${img.id}`
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.getByDefectId:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defect-customer-image/:id
   * Delete image by ID
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = this.extractUserId(req);

      const result = await this.service.delete(id, userId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.delete:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defect-customer-image/defect/:defectId
   * Delete all images for a defect
   */
  deleteByDefectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defectId = parseInt(req.params.defectId);
      const userId = this.extractUserId(req);

      const result = await this.service.deleteByDefectId(defectId, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { deletedCount: result.data },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.deleteByDefectId:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-customer-image/health
   * Health check
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.healthCheck();

      res.status(result.healthy ? 200 : 503).json({
        success: result.healthy,
        message: result.message,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in DefectImageController.healthCheck:', error);
      next(error);
    }
  };
}

/**
 * Factory function to create controller instance
 */
export function createDefectImageController(service: DefectImageService): DefectImageController {
  return new DefectImageController(service);
}