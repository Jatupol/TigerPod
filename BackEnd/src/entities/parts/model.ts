// server/src/entities/parts/model.ts
/**
 * SIMPLIFIED: Parts Entity Model - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import { Pool } from 'pg';
import { GenericSpecialModel } from '../../generic/entities/special-entity/generic-model';
import {
  ISpecialModel
} from '../../generic/entities/special-entity/generic-types';

import {
  Parts,
  CreatePartsRequest,
  UpdatePartsRequest,
  PARTS_ENTITY_CONFIG
} from './types';

// ==================== SIMPLE PARTS MODEL CLASS ====================

/**
 * Simple Parts Entity Model - extends GenericSpecialModel for basic CRUD
 */
export class PartsModel extends GenericSpecialModel<Parts> implements ISpecialModel<Parts> {

  constructor(db: Pool) {
    super(db, PARTS_ENTITY_CONFIG);
  }

  // ==================== REQUIRED ISPECIALMODEL METHODS ====================

  /**
   * Find part by partno (primary key)
   */
  async getByKey(keyValues: Record<string, any>): Promise<Parts | null> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        throw new Error('Part number is required');
      }

      const query = `
        SELECT * FROM parts
        WHERE partno = $1
      `;

      const result = await this.db.query(query, [partno]);

      return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
    } catch (error: any) {
      console.error('Parts getByKey error:', error);
      throw new Error(`Failed to find part: ${error.message}`);
    }
  }

  /**
   * Get all parts with customer-site relationship and search support
   * Supports pagination with page and limit parameters
   */
  async getAll(searchTerm?: string, page?: number, limit?: number): Promise<Parts[]> {
    try {
      let query = `
        SELECT
          p.*,
          cs.code as customer_site_code,
          c.name as customer_name
        FROM parts p
        LEFT JOIN customers_site cs ON p.customer = cs.customers AND p.part_site = cs.site
        LEFT JOIN customers c ON p.customer = c.code
      `;

      const params: any[] = [];
      let paramIndex = 1;

      // Add search functionality if search term is provided
      if (searchTerm && searchTerm.trim()) {
        const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
        const searchConditions = [
          `p.partno ILIKE $${paramIndex}`,
          `p.product_families ILIKE $${paramIndex}`,
          `p.versions ILIKE $${paramIndex}`,
          `p.production_site ILIKE $${paramIndex}`,
          `p.part_site ILIKE $${paramIndex}`,
          `p.customer ILIKE $${paramIndex}`,
          `p.tab ILIKE $${paramIndex}`,
          `p.product_type ILIKE $${paramIndex}`,
          `p.customer_driver ILIKE $${paramIndex}`
        ];

        query += ` WHERE (${searchConditions.join(' OR ')})`;
        params.push(`%${sanitizedSearch}%`);
        paramIndex++;
      }

      query += ` ORDER BY p.partno ASC`;

      // Add pagination if page and limit are provided
      if (limit && limit > 0) {
        query += ` LIMIT $${paramIndex}`;
        params.push(limit);
        paramIndex++;

        if (page && page > 0) {
          const offset = (page - 1) * limit;
          query += ` OFFSET $${paramIndex}`;
          params.push(offset);
        }
      }

      console.log('🔧 Parts query with pagination:', { page, limit, searchTerm });

      const result = await this.db.query(query, params);

      return result.rows.map(row => this.mapRowToEntity(row, searchTerm));
    } catch (error: any) {
      console.error('Parts getAll error:', error);
      throw new Error(`Failed to get parts: ${error.message}`);
    }
  }

  /**
   * Get total count of parts (for pagination)
   */
  async getCount(searchTerm?: string): Promise<number> {
    try {
      let query = `
        SELECT COUNT(*) as total
        FROM parts p
      `;

      const params: any[] = [];

      // Add search functionality if search term is provided
      if (searchTerm && searchTerm.trim()) {
        const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
        const searchConditions = [
          'p.partno ILIKE $1',
          'p.product_families ILIKE $1',
          'p.versions ILIKE $1',
          'p.production_site ILIKE $1',
          'p.part_site ILIKE $1',
          'p.customer ILIKE $1',
          'p.tab ILIKE $1',
          'p.product_type ILIKE $1',
          'p.customer_driver ILIKE $1'
        ];

        query += ` WHERE (${searchConditions.join(' OR ')})`;
        params.push(`%${sanitizedSearch}%`);
      }

      const result = await this.db.query(query, params);
      return parseInt(result.rows[0].total, 10);
    } catch (error: any) {
      console.error('Parts getCount error:', error);
      return 0;
    }
  }

  /**
   * Create new part
   */
  async create(data: CreatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
    try {
      const query = `
        INSERT INTO parts (
          partno, product_families, versions, production_site,
          part_site, customer, tab, product_type, customer_driver,
          is_active, created_by, updated_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        data.partno,
        data.product_families,
        data.versions,
        data.production_site,
        data.part_site,
        data.customer,
        data.tab,
        data.product_type,
        data.customer_driver,
        data.is_active !== undefined ? data.is_active : true,
        userId || 0,
        userId || 0,
        new Date(),
        new Date()
      ];

      console.log('🔧 Executing parts create query:', { partno: data.partno });

      const result = await this.db.query(query, values);

      if (result.rows.length > 0) {
        console.log('✅ Part created successfully');
        return {
          success: true,
          data: this.mapRowToEntity(result.rows[0])
        };
      } else {
        return {
          success: false,
          error: 'Failed to create part'
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating part:', error);

      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        return {
          success: false,
          error: 'Part number already exists'
        };
      }

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  /**
   * Update part by partno
   */
  async update(keyValues: Record<string, any>, data: UpdatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return {
          success: false,
          error: 'Part number is required for update'
        };
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.product_families !== undefined) {
        updateFields.push(`product_families = $${paramCount}`);
        values.push(data.product_families);
        paramCount++;
      }

      if (data.versions !== undefined) {
        updateFields.push(`versions = $${paramCount}`);
        values.push(data.versions);
        paramCount++;
      }

      if (data.production_site !== undefined) {
        updateFields.push(`production_site = $${paramCount}`);
        values.push(data.production_site);
        paramCount++;
      }

      if (data.part_site !== undefined) {
        updateFields.push(`part_site = $${paramCount}`);
        values.push(data.part_site);
        paramCount++;
      }

      if (data.customer !== undefined) {
        updateFields.push(`customer = $${paramCount}`);
        values.push(data.customer);
        paramCount++;
      }

      if (data.tab !== undefined) {
        updateFields.push(`tab = $${paramCount}`);
        values.push(data.tab);
        paramCount++;
      }

      if (data.product_type !== undefined) {
        updateFields.push(`product_type = $${paramCount}`);
        values.push(data.product_type);
        paramCount++;
      }

      if (data.customer_driver !== undefined) {
        updateFields.push(`customer_driver = $${paramCount}`);
        values.push(data.customer_driver);
        paramCount++;
      }

      if (data.is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount}`);
        values.push(data.is_active);
        paramCount++;
      }

      updateFields.push(`updated_by = $${paramCount}`);
      values.push(userId);
      paramCount++;


      // Always update the timestamp
      updateFields.push(`updated_at = $${paramCount}`);
      values.push(new Date());
      paramCount++;

      if (updateFields.length === 1) { // Only updated_at
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      // Add WHERE clause parameter
      values.push(partno);

      const query = `
        UPDATE parts
        SET ${updateFields.join(', ')}
        WHERE partno = $${paramCount}
        RETURNING *
      `;

      console.log('🔧 Executing parts update query:', { partno });

      const result = await this.db.query(query, values);

      if (result.rows.length > 0) {
        console.log('✅ Part updated successfully');
        return {
          success: true,
          data: this.mapRowToEntity(result.rows[0])
        };
      } else {
        return {
          success: false,
          error: 'Part not found'
        };
      }
    } catch (error: any) {
      console.error('❌ Error updating part:', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }


  /**
   * Replace part
   */
  async replace(data: CreatePartsRequest, userId: number): Promise<{ success: boolean; data?: Parts; error?: string }> {
    try {
      const query = `
        INSERT INTO parts (
          partno, product_families, versions, production_site,
          part_site, customer, tab, product_type, customer_driver,
          is_active, created_by, updated_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (partno) DO UPDATE SET
          product_families = EXCLUDED.product_families,
          versions = EXCLUDED.versions,
          production_site = EXCLUDED.production_site,
          part_site = EXCLUDED.part_site,
          customer = EXCLUDED.customer,
          tab = EXCLUDED.tab,
          product_type = EXCLUDED.product_type,
          customer_driver = EXCLUDED.customer_driver,
          is_active = EXCLUDED.is_active,
          updated_by = EXCLUDED.updated_by,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `; 


      const values = [
        data.partno,
        data.product_families,
        data.versions,
        data.production_site,
        data.part_site,
        data.customer,
        data.tab,
        data.product_type,
        data.customer_driver,
        true, //is_active
        userId || 0,
        userId || 0,
        new Date(),
        new Date()
      ];

      console.log('🔧 Executing parts create query:', { partno: data.partno });

      const result = await this.db.query(query, values);

      if (result.rows.length > 0) {
        console.log('✅ Part created successfully');
        return {
          success: true,
          data: this.mapRowToEntity(result.rows[0])
        };
      } else {
        return {
          success: false,
          error: 'Failed to create part'
        };
      }
    } catch (error: any) {
      console.error('❌ Error creating part:', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }


  /**
   * Delete part by partno
   */
  async delete(keyValues: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return {
          success: false,
          error: 'Part number is required for deletion'
        };
      }

      const query = `
        DELETE FROM parts
        WHERE partno = $1
      `;

      console.log('🔧 Executing parts delete query:', { partno });

      const result = await this.db.query(query, [partno]);

      if (result.rowCount && result.rowCount > 0) {
        console.log('✅ Part deleted successfully');
        return {
          success: true
        };
      } else {
        return {
          success: false,
          error: 'Part not found'
        };
      }
    } catch (error: any) {
      console.error('❌ Error deleting part:', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }
  /**
   * Synchronize data method from  inf_lotinput 
   */
  async synceData(): Promise<{ success: boolean; error?: string }> {
    try {
 

 
      const query = `
        insert into parts (partno, product_families,versions, production_site)
        SELECT itemno, model, version, partsite
        from  inf_lotinput 
        where partsite is not null
        and itemno not in (select partno from parts)
        group by itemno, model, version,  partsite
        order by itemno
      `;

      console.log('🔧 Executing parts Synchronize data query:');

      const result = await this.db.query(query);

      if (result.rowCount && result.rowCount > 0) {
        console.log('✅ Part Synchronize data successfully');
        return {
          success: true
        };
      } else {
        return {
          success: false,
          error: 'Nodaata for Synchronize'
        };
      }
    } catch (error: any) {
      console.error('❌ Error Synchronize data part:', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }
  /**
   * Check if part exists by partno
   */
  async exists(keyValues: Record<string, any>): Promise<boolean> {
    try {
      const { partno } = keyValues;

      if (!partno) {
        return false;
      }

      const query = `
        SELECT 1 FROM parts
        WHERE partno = $1
        LIMIT 1
      `;

      const result = await this.db.query(query, [partno]);

      return result.rows.length > 0;
    } catch (error: any) {
      console.error('Parts exists error:', error);
      return false;
    }
  }

  /**
   * Resolve customer and site from customer_site_code
   */
  async resolveCustomerSite(customerSiteCode: string): Promise<any> {
    try {
      if (!customerSiteCode) {
        return null;
      }

      const query = `
        SELECT customers, site
        FROM customers_site
        WHERE code = $1 AND is_active = true
      `;

      const result = await this.db.query(query, [customerSiteCode]);

      if (result.rows.length > 0) {
        return {
          customer: result.rows[0].customers,
          site: result.rows[0].site
        };
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error resolving customer-site:', error);
      return null;
    }
  }

  /**
   * GET /api/parts/customer-sites
   * Get available customer-sites for parts form
   */
 async getCustomerSites(): Promise<any> {
    try {
   
      // Get active customer-sites from the database
      const query = `
        SELECT
          cs.code,
          cs.customers,
          cs.site,
          c.name as customer_name
        FROM customers_site cs
        LEFT JOIN customers c ON cs.customers = c.code
        WHERE cs.is_active = true
        ORDER BY c.name ASC, cs.site ASC
      `;

      const result = await await this.db.query(query);

      if (result.rows.length > 0) {
        return result;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Error getting customer-sites:', error);
      return null;
    } 
  };
  // ==================== HELPER METHODS ====================

  /**
   * Map database row to Parts entity
   */
  private mapRowToEntity(row: any, searchTerm?: string): Parts {
    const entity: Parts = {
      partno: row.partno,
      product_families: row.product_families,
      versions: row.versions,
      production_site: row.production_site,
      part_site: row.part_site,
      customer: row.customer,
      tab: row.tab,
      product_type: row.product_type,
      customer_driver: row.customer_driver,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      updated_by: row.updated_by,
      // Additional fields from JOINs
      customer_site_code: row.customer_site_code || undefined,
      customer_name: row.customer_name || undefined
    };

    // Add highlighting if search term is provided
    if (searchTerm && searchTerm.trim()) {
      entity.highlight = this.createHighlightedFields(entity, searchTerm);
    }

    return entity;
  }

  /**
   * Create highlighted fields for search results
   */
  private createHighlightedFields(entity: Parts, searchTerm: string): Record<string, string> {
    const highlighted: Record<string, string> = {};
    const searchableFields = ['partno', 'product_families', 'versions', 'production_site', 'part_site', 'customer', 'tab', 'product_type', 'customer_driver'];

    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

    searchableFields.forEach(field => {
      const value = entity[field as keyof Parts] as string;
      if (value && typeof value === 'string') {
        const highlightedValue = value.replace(regex, '<mark>$1</mark>');
        // Only include field in highlight if it was actually highlighted (contains search term)
        if (highlightedValue !== value) {
          highlighted[field] = highlightedValue;
        }
      }
    });

    console.log(`🔍 Highlighting for "${searchTerm}":`, Object.keys(highlighted));
    return highlighted;
  }

  /**
   * Build WHERE clause for single primary key
   */
  protected buildKeyWhereClause(keyValues: Record<string, any>): { clause: string; params: any[] } {
    const { partno } = keyValues;
    return {
      clause: 'partno = $1',
      params: [partno]
    };
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create Parts model instance
 */
export function createPartsModel(db: Pool): PartsModel {
  return new PartsModel(db);
}

export default PartsModel;