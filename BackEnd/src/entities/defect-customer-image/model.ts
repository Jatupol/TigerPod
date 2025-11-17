// server/src/entities/defect-customer-image/model.ts
/**
 * Defect Customer Image Entity Model
 * Complete Separation Entity Architecture
 * Refactored to use BaseDefectImageModel for code reuse
 */

import { Pool } from 'pg';
import { BaseDefectImageModel } from '../defect-image/base-model';
import {
  DefectImage,
  CreateDefectImageRequest,
  DefectImageConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';

/**
 * Defect Image Model - Database operations
 * Extends base model to inherit common functionality
 */
export class DefectImageModel extends BaseDefectImageModel<DefectImage, CreateDefectImageRequest> {
  constructor(db: Pool, config: DefectImageConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
    super(db, config);
  }

  // All CRUD operations are inherited from BaseDefectImageModel
  // Add defect-image specific methods here if needed in the future
}

/**
 * Factory function to create model instance
 */
export function createDefectImageModel(db: Pool): DefectImageModel {
  return new DefectImageModel(db);
}