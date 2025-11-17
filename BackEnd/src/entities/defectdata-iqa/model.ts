// server/src/entities/defectdata-iqa/model.ts
/**
 * Defect Image Entity Model
 * Complete Separation Entity Architecture
 */

import { Pool } from 'pg';
import {
  DefectDataIQA,
  CreateDefectDataIQARequest,
  DefectDataIQAConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';

/**
 * Defect Image Model - Database operations
 */
export class DefectDataIQAModel {
  private db: Pool;
  private config: DefectDataIQAConfig;

  constructor(db: Pool, config: DefectDataIQAConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
    this.db = db;
    this.config = config;
  }

  /**
   * Create a new defect image
   */
  async create(data: CreateDefectDataIQARequest): Promise<DefectDataIQA> {
    const query = `
      INSERT INTO ${this.config.tableName} (defect_id, iqaid, defect_description, imge_data)
      VALUES ($1, $2, $3, $4)
      RETURNING id, defect_id, iqaid, defect_description, imge_data
    `;

    const result = await this.db.query(query, [
      data.defect_id,
      data.iqaid || null,
      data.defect_description || '',
      data.imge_data
    ]);

    return result.rows[0];
  }

  /**
   * Bulk create defect images
   */
  async bulkCreate(defectId: number, images: Buffer[], defectDescription?: string, iqaid?: number): Promise<DefectDataIQA[]> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      const createdImages: DefectDataIQA[] = [];

      for (const imageData of images) {
        const query = `
          INSERT INTO ${this.config.tableName} (defect_id, iqaid, defect_description, imge_data)
          VALUES ($1, $2, $3, $4)
          RETURNING id, defect_id, iqaid, defect_description, imge_data
        `;

        const result = await client.query(query, [
          defectId,
          iqaid || null,
          defectDescription || '',
          imageData
        ]);
        createdImages.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return createdImages;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number): Promise<DefectDataIQA | null> {
    const query = `
      SELECT id, defect_id, iqaid, defect_description, imge_data
      FROM ${this.config.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get all images for a defect
   */
  async getByDefectId(defectId: number): Promise<DefectDataIQA[]> {
    const query = `
      SELECT id, defect_id, iqaid, defect_description, imge_data
      FROM ${this.config.tableName}
      WHERE defect_id = $1
      ORDER BY id ASC
    `;

    const result = await this.db.query(query, [defectId]);
    return result.rows;
  }

  /**
   * Get all images for an IQA record
   */
  async getByIQAId(iqaid: number): Promise<DefectDataIQA[]> {
    const query = `
      SELECT id, defect_id, iqaid, defect_description, imge_data
      FROM ${this.config.tableName}
      WHERE iqaid = $1
      ORDER BY id ASC
    `;

    const result = await this.db.query(query, [iqaid]);
    return result.rows;
  }

  /**
   * Delete image by ID
   */
  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE id = $1
    `;

    const result = await this.db.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete all images for a defect
   */
  async deleteByDefectId(defectId: number): Promise<number> {
    const query = `
      DELETE FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;

    const result = await this.db.query(query, [defectId]);
    return result.rowCount ?? 0;
  }

  /**
   * Count images for a defect
   */
  async countByDefectId(defectId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;

    const result = await this.db.query(query, [defectId]);
    return parseInt(result.rows[0].count, 10);
  }
}

/**
 * Factory function to create model instance
 */
export function createDefectDataIQAModel(db: Pool): DefectDataIQAModel {
  return new DefectDataIQAModel(db);
}