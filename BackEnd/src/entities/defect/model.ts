// server/src/entities/defect/model.ts
/* Defect Entity Model - Complete Separation Entity Architecture
 * SERIAL ID Pattern Implementation
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSerialIdModel for 90% code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained defect data access layer
 * ✅ Manufacturing Quality Control domain optimized
 * 
 * Database Schema Compliance:
 * - Table: defects
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SERIAL ID Entity
 * - API Routes: /api/defects/:id
 */

import { Pool } from 'pg';
import { GenericSerialIdModel } from '../../generic/entities/serial-id-entity/generic-model';
import {
  ISerialIdModel,
  SerialIdPaginatedResponse,
  SerialIdQueryOptions
} from '../../generic/entities/serial-id-entity/generic-types';
import {
  Defect,
  CreateDefectData,
  UpdateDefectData,
  DefectQueryOptions,
  DefectSummary,
  DefectProfile,
  DEFAULT_DEFECT_CONFIG
} from './types';

// ==================== DEFECT MODEL CLASS ====================

/**
 * Defect Entity Model
 * 
 * Data access layer for defect management extending Generic Serial ID pattern.
 * Provides defect-specific database operations while maintaining architectural separation.
 * 
 * Features:
 * - Complete CRUD operations via generic pattern
 * - Defect-specific query optimizations
 * - Manufacturing Quality Control optimized operations
 * - Enhanced search and filtering capabilities
 */
export class DefectModel extends GenericSerialIdModel<Defect> implements ISerialIdModel<Defect> {
  
  constructor(db: Pool) {
    super(db, DEFAULT_DEFECT_CONFIG);
  }

  // ==================== OVERRIDE CRUD OPERATIONS ====================

  /**
   * Create new defect with defect_group support
   * Override to handle custom defect_group field
   */
  async create(data: CreateDefectData, userId: number): Promise<Defect> {
    const now = new Date();

    // Build insert fields and values
    const fields = ['name', 'description', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
    const values: any[] = [
      data.name,
      data.description || '',
      data.is_active !== undefined ? data.is_active : true,
      userId,
      userId,
      now,
      now
    ];

    // Add defect_group if provided
    if (data.defect_group !== undefined) {
      fields.push('defect_group');
      values.push(data.defect_group || null);
    }

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.config.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, values);
      console.log('✅ DefectModel.create - Created defect:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ DefectModel.create - Error:', error);
      throw new Error(`Failed to create defect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing defect with defect_group support
   * Override to handle custom defect_group field
   */
  async update(id: number, data: UpdateDefectData, userId: number): Promise<Defect> {
    const now = new Date();

    // Build update fields
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(data.description);
      paramIndex++;
    }

    if (data.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(data.is_active);
      paramIndex++;
    }

    // Handle defect_group field
    if (data.defect_group !== undefined) {
      updates.push(`defect_group = $${paramIndex}`);
      params.push(data.defect_group || null);
      paramIndex++;
    }

    // Always update timestamp and user
    updates.push(`updated_by = $${paramIndex}`);
    params.push(userId);
    paramIndex++;

    updates.push(`updated_at = $${paramIndex}`);
    params.push(now);
    paramIndex++;

    // Add ID for WHERE clause
    params.push(id);

    const query = `
      UPDATE ${this.config.tableName}
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.db.query(query, params);
      if (result.rows.length === 0) {
        throw new Error(`Defect with ID ${id} not found`);
      }
      console.log('✅ DefectModel.update - Updated defect:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ DefectModel.update - Error:', error);
      throw new Error(`Failed to update defect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ==================== DEFECT-SPECIFIC OPERATIONS ====================

  /**
   * Get defects filtered by defect group
   * Supports additional filtering by status and search
   */
  async getByDefectGroup(
    defectGroup: string,
    options: DefectQueryOptions = {}
  ): Promise<SerialIdPaginatedResponse<Defect>> {
    console.log('🔧 DefectModel.getByDefectGroup - defect_group filter:', defectGroup);

    const client = await this.db.connect();

    try {
      const page = options.page || 1;
      const limit = options.limit || 50;
      const offset = (page - 1) * limit;
      const sortBy = (options.sortBy as string) || 'id';
      const sortOrder = options.sortOrder || 'desc';

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      // Add defect_group filter - use case-insensitive comparison with trimming
      conditions.push(`LOWER(TRIM(defect_group)) = LOWER(TRIM($${paramCount}))`);
      params.push(defectGroup);
      console.log('🔧 DefectModel.getByDefectGroup - defect_group param:', defectGroup);
      paramCount++;

      // Add isActive filter if provided
      if (options.isActive !== undefined) {
        conditions.push(`is_active = $${paramCount}`);
        params.push(options.isActive);
        paramCount++;
      }

      // Add search filter if provided
      if (options.search) {
        conditions.push(`(LOWER(name) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`);
        params.push(`%${options.search.toLowerCase()}%`);
        paramCount++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM defects ${whereClause}`;
      console.log('🔧 DefectModel.getByDefectGroup - Count query:', countQuery);
      console.log('🔧 DefectModel.getByDefectGroup - Query params:', params);

      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);
      console.log('🔧 DefectModel.getByDefectGroup - Total results found:', total);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM defects
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      const dataParams = [...params, limit, offset];
      console.log('🔧 DefectModel.getByDefectGroup - Data query:', dataQuery);
      console.log('🔧 DefectModel.getByDefectGroup - Data params:', dataParams);

      const dataResult = await client.query(dataQuery, dataParams);
      console.log('🔧 DefectModel.getByDefectGroup - Rows returned:', dataResult.rows.length);

      return {
        data: dataResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check if defect name is unique
   *
   * Validates defect name uniqueness for business rules
   */
  async isDefectNameUnique(name: string, excludeId?: number): Promise<boolean> {
    const client = await this.db.connect();
    
    try {
      let query = 'SELECT COUNT(*) as count FROM defects WHERE LOWER(name) = LOWER($1)';
      const params: any[] = [name.trim()];

      if (excludeId) {
        query += ' AND id != $2';
        params.push(excludeId);
      }

      const result = await client.query(query, params);
      return parseInt(result.rows[0].count) === 0;
    } finally {
      client.release();
    }
  }

   
  // ==================== HELPER METHODS ====================

  /**
   * Transform defect-specific query options to generic options
   *
   * Maps DefectQueryOptions to SerialIdQueryOptions for generic compatibility
   */
  private transformDefectQueryOptions(options: DefectQueryOptions): SerialIdQueryOptions {
    const genericOptions: SerialIdQueryOptions = {
      page: options.page,
      limit: options.limit,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      search: options.search,
      isActive: options.isActive
    };

    // Handle defect-specific filters
    if (options.nameContains) {
      genericOptions.search = options.nameContains;
    }

    if (options.descriptionContains) {
      // If both nameContains and descriptionContains are provided, combine them
      if (genericOptions.search) {
        genericOptions.search = `${genericOptions.search} ${options.descriptionContains}`;
      } else {
        genericOptions.search = options.descriptionContains;
      }
    }

    // Note: defect_group and hasDescription filters would require custom query implementation
    // For now, we'll use the generic pattern and filters can be added later

    return genericOptions;
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a defect model instance
 * 
 * Provides dependency injection pattern for defect model creation
 */
export function createDefectModel(db: Pool): DefectModel {
  return new DefectModel(db);
}

// ==================== DEFAULT EXPORT ====================

export default DefectModel;

 