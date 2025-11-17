// server/src/entities/defectdatacustomer/model.ts
/**
 * DefectDataCustomer Entity Model - Complete Separation Entity Architecture
 * SPECIAL Pattern Implementation
 *
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericSpecialModel for maximum code reuse
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained defectdatacustomer data access layer
 * ✅ Manufacturing Quality Control domain optimized
 *
 * Database Schema Compliance:
 * - Table: defectdatacustomer
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID with complex structure)
 * - API Routes: /api/defectdatacustomer/:id
 */

import { Pool } from 'pg';
import { GenericSpecialModel } from '../../generic/entities/special-entity/generic-model';
import {
  ISpecialModel,
  SpecialPaginatedResponse,
  SpecialQueryOptions,
  EntityHealthResult,
  EntityStatisticsResult
} from '../../generic/entities/special-entity/generic-types';
import {
  DefectData,
  DefectDetail,
  DefectEmail ,
  CreateDefectDataRequest,
  UpdateDefectDataRequest,
  DefectDataQueryOptions,
  DefectDataSummary,
  DefectDataProfile,
  DefectDataTrend,
  InspectorPerformance,
  DEFAULT_DEFECTDATA_CONFIG  
} from './types';

// ==================== DEFECTDATA MODEL CLASS ====================

/**
 * DefectData Entity Model
 *
 * Data access layer for defect data management extending Generic SPECIAL pattern.
 * Provides defect data-specific database operations while maintaining architectural separation.
 *
 * Features:
 * - Complete CRUD operations via generic pattern
 * - DefectData-specific query optimizations
 * - Manufacturing Quality Control optimized operations
 * - Enhanced search and filtering capabilities
 * - Analytics and reporting support
 */
export class DefectDataModel extends GenericSpecialModel<DefectData> implements ISpecialModel<DefectData> {

  constructor(db: Pool) {
    super(db, DEFAULT_DEFECTDATA_CONFIG);
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create new defect data record
   */
  async create(data: CreateDefectDataRequest, userId?: number): Promise<DefectData> {
    const client = await this.db.connect();

    try {
      const query = `
        INSERT INTO ${this.config.tableName} (
          inspection_no, defect_date, qc_name, qclead_name, mbr_name,
          linevi, groupvi, station, inspector, defect_id, ng_qty,
          trayno, tray_position, color, defect_detail, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16 )
        RETURNING *
      `;

      const values = [
        data.inspection_no,
        data.defect_date || new Date(),
        data.qc_name,
        data.qclead_name,
        data.mbr_name,
        data.linevi,
        data.groupvi,
        data.station,
        data.inspector,
        data.defect_id,
        data.ng_qty || 0,
        data.trayno || null,
        data.tray_position || null,
        data.color || null,
        data.defect_detail || null,
        userId || 0
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  /**
   * Update defect data record
   */
  async update(id: number, data: UpdateDefectDataRequest, userId?: number): Promise<DefectData | null> {
    const client = await this.db.connect();

    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (data.inspection_no !== undefined) {
        updateFields.push(`inspection_no = $${paramCount++}`);
        values.push(data.inspection_no);
      }
      if (data.defect_date !== undefined) {
        updateFields.push(`defect_date = $${paramCount++}`);
        values.push(data.defect_date);
      }
      if (data.qc_name !== undefined) {
        updateFields.push(`qc_name = $${paramCount++}`);
        values.push(data.qc_name);
      }
      if (data.qclead_name !== undefined) {
        updateFields.push(`qclead_name = $${paramCount++}`);
        values.push(data.qclead_name);
      }
      if (data.mbr_name !== undefined) {
        updateFields.push(`mbr_name = $${paramCount++}`);
        values.push(data.mbr_name);
      }
      if (data.linevi !== undefined) {
        updateFields.push(`linevi = $${paramCount++}`);
        values.push(data.linevi);
      }
      if (data.groupvi !== undefined) {
        updateFields.push(`groupvi = $${paramCount++}`);
        values.push(data.groupvi);
      }
      if (data.station !== undefined) {
        updateFields.push(`station = $${paramCount++}`);
        values.push(data.station);
      }
      if (data.inspector !== undefined) {
        updateFields.push(`inspector = $${paramCount++}`);
        values.push(data.inspector);
      }
      if (data.defect_id !== undefined) {
        updateFields.push(`defect_id = $${paramCount++}`);
        values.push(data.defect_id);
      }
      if (data.ng_qty !== undefined) {
        updateFields.push(`ng_qty = $${paramCount++}`);
        values.push(data.ng_qty);
      }
      if (data.trayno !== undefined) {
        updateFields.push(`trayno = $${paramCount++}`);
        values.push(data.trayno);
      }
      if (data.tray_position !== undefined) {
        updateFields.push(`tray_position = $${paramCount++}`);
        values.push(data.tray_position);
      }
      if (data.color !== undefined) {
        updateFields.push(`color = $${paramCount++}`);
        values.push(data.color);
      }

      // Always update updated_by and updated_at
      updateFields.push(`updated_by = $${paramCount++}`);
      values.push(userId || 0);
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add ID as last parameter
      values.push(id);

      const query = `
        UPDATE ${this.config.tableName}
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}  
        RETURNING *
      `;

      const result = await client.query(query, values);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  /**
   * Delete Defect data Id
   */
  async delete(id:string): Promise<{ success: boolean; error?: string }> {
    try {
 

      if (!id) {
        return {
          success: false,
          error: 'Defect data Id is required for deletion'
        };
      }

      const query = ` DELETE FROM ${this.config.tableName} WHERE id = $1 `;

      console.log('🔧 Executing defectdata_customer delete query:', { id });

      const result = await this.db.query(query, [id]);

      if (result.rowCount && result.rowCount > 0) {
        console.log('✅ Defect data deleted successfully');
        return {
          success: true
        };
      } else {
        return {
          success: false,
          error: 'Defect data not found'
        };
      }
    } catch (error: any) {
      console.error('❌ Error deleting Defect data :', error);

      return {
        success: false,
        error: error.message || 'Database error occurred'
      };
    }
  }

  // ==================== DEFECTDATA-SPECIFIC OPERATIONS ====================

  /**
   * Get defect data by inspection number
   *
   * Returns all defect data records for a specific inspection
   */
  async getByInspectionNo(inspectionNo: string): Promise<DefectData[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = $1
        ORDER BY dd.created_at DESC
      `;

      const result = await client.query(query, [inspectionNo]);
      return result.rows.map(row => this.transformRowToEntity(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get defect Detail data by inspection number
   *
   * Returns all defect data records for a specific inspection
   */
  async getDetailByInspectionNo(inspectionNo: string): Promise<DefectDetail[]> {
    const client = await this.db.connect();

    try {
      // Query to get defect details with aggregated image URLs (NOT base64 data)
      // Use array_agg to collect image_url strings into an array
      const query = `
        SELECT
            v.id, v.inspection_no, v.defect_date, v.inspector, v.qc_name, v.qclead_name
          , v.mbr_name, v.linevi, v.groupvi, v.station, v.trayno, v.tray_position, v.color
          , v.ng_qty, v.defect_detail, v.inspector_fullname, v.qc_fullname, v.qclead_fullname
          , v.mbr_fullname, v.defect_id, v.defect_name, v.defect_description, v.defect_group
          , v.created_by, v.created_at, image_urls 
        FROM v_defectdata_customer v
        LEFT JOIN v_defect_image_customer di ON di.defect_id = v.id
        WHERE v.inspection_no = $1
        ORDER BY v.created_at DESC
      `;

      const result = await client.query(query, [inspectionNo]);
      return result.rows.map(row => this.transformRowToDefectDetail(row));
    } finally {
      client.release();
    }
  }

    /**
   * Get defect Email Detail data by inspection number
   *
   * Returns all defect email data records   for a specific inspection
   */
  async getEmailById(defectId: number): Promise<DefectEmail[]> {
    const client = await this.db.connect();

    try {
      // Query to get defect details with aggregated images as base64 data URIs for email embedding
      const query = `
        SELECT
            v.id, v.inspection_no, v.defect_date, v.inspector, v.qc_name, v.qclead_name
          , v.mbr_name, v.linevi, v.groupvi, i.station, v.trayno, v.tray_position, v.color
          , v.ng_qty, v.defect_detail, v.inspector_fullname, v.qc_fullname, v.qclead_fullname
          , v.mbr_fullname, v.defect_id, v.defect_name, v.defect_description, v.defect_group
          , v.created_by, v.created_at, p.tab, i.lotno, i.model, i.version
          , i.itemno, i.shift, i.fvilineno
          , COALESCE(
              (SELECT json_agg('data:image/jpeg;base64,' || replace(encode(di.imge_data, 'base64'), E'\n', ''))
               FROM defect_image di
               WHERE di.defect_id = v.id),
              '[]'::json
            ) as image_urls
        FROM v_defectdata_customer v
        LEFT JOIN v_inspectiondata_customer  i ON i.inspection_no = v.inspection_no
        LEFT JOIN parts p ON p.partno = i.itemno
        WHERE v.id = $1
        ORDER BY v.created_at DESC
      `;

      const result = await client.query(query, [defectId]);
      return result.rows.map(row => this.transformRowToDefectEmail(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data by station and date range
   *
   * Optimized for station-based reporting
   */
  async getByStationAndDateRange(
    station: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<DefectData[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.station = $1
        AND dd.defect_date >= $2
        AND dd.defect_date <= $3
        ORDER BY dd.defect_date DESC, dd.created_at DESC
        LIMIT $4
      `;

      const result = await client.query(query, [station, startDate, endDate, limit]);
      return result.rows.map(row => this.transformRowToEntity(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data by inspector
   *
   * Useful for inspector performance analysis
   */
  async getByInspector(inspector: string, limit: number = 100): Promise<DefectData[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspector = $1
        ORDER BY dd.defect_date DESC, dd.created_at DESC
        LIMIT $2
      `;

      const result = await client.query(query, [inspector, limit]);
      return result.rows.map(row => this.transformRowToEntity(row));
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data profile with detailed information
   *
   * Returns a single defect data record with related information
   */
  async getProfile(id: number): Promise<DefectDataProfile | null> {
    const client = await this.db.connect();

    try {
      // Get main record with defect information
      const mainQuery = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.id = $1 
      `;

      const mainResult = await client.query(mainQuery, [id]);
      if (mainResult.rows.length === 0) {
        return null;
      }

      const mainRecord = this.transformRowToEntity(mainResult.rows[0]) as DefectDataProfile;
      mainRecord.defect_name = mainResult.rows[0].defect_name;
      mainRecord.defect_description = mainResult.rows[0].defect_description;

      // Get related records (same inspection)
      const relatedQuery = `
        SELECT
          dd.*,
          d.name as defect_name
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = $1
        AND dd.id != $2
        ORDER BY dd.created_at DESC
        LIMIT 10
      `;

      const relatedResult = await client.query(relatedQuery, [mainRecord.inspection_no, id]);
      mainRecord.related_records = relatedResult.rows.map(row => this.transformRowToEntity(row));

      // Get summary stats
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM ${this.config.tableName} WHERE inspection_no = $1 ) as same_inspection_count,
          (SELECT COUNT(*) FROM ${this.config.tableName} WHERE station = $2 ) as same_station_count,
          (SELECT COUNT(*) FROM ${this.config.tableName} WHERE defect_id = $3 ) as same_defect_count
      `;
 
      const statsResult = await client.query(statsQuery, [
        mainRecord.inspection_no,
        mainRecord.station,
        mainRecord.defect_id
      ]);

      mainRecord.summary_stats = {
        same_inspection_count: parseInt(statsResult.rows[0].same_inspection_count),
        same_station_count: parseInt(statsResult.rows[0].same_station_count),
        same_defect_count: parseInt(statsResult.rows[0].same_defect_count)
      };

      return mainRecord;
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data summary for analytics
   *
   * Returns comprehensive summary statistics
   */
  async getSummary(startDate?: Date, endDate?: Date): Promise<DefectDataSummary> {
    const client = await this.db.connect();

    try {
      const dateFilter = startDate && endDate
        ? 'AND dd.defect_date >= $1 AND dd.defect_date <= $2'
        : '';
      const params = startDate && endDate ? [startDate, endDate] : [];

      // Get basic counts
      const basicQuery = `
        SELECT
          COUNT(*) as total_records,
          COUNT(CASE WHEN dd.defect_date >= CURRENT_DATE THEN 1 END) as today_records,
          COUNT(CASE WHEN dd.defect_date >= date_trunc('week', CURRENT_DATE) THEN 1 END) as this_week_records,
          COUNT(CASE WHEN dd.defect_date >= date_trunc('month', CURRENT_DATE) THEN 1 END) as this_month_records,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty,
          MAX(dd.defect_date) as latest_record_at
        FROM ${this.config.tableName} dd
        WHERE 1=1 ${dateFilter}
      `;

      const basicResult = await client.query(basicQuery, params);
      const basicStats = basicResult.rows[0];

      // Get by station
      const stationQuery = `
        SELECT
          dd.station,
          COUNT(*) as count,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty,
          array_agg(DISTINCT d.name) as defect_types
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE 1=1 ${dateFilter}
        GROUP BY dd.station
        ORDER BY count DESC
      `;

      const stationResult = await client.query(stationQuery, params);

      // Get by linevi
      const lineviQuery = `
        SELECT
          dd.linevi,
          COUNT(*) as count,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty
        FROM ${this.config.tableName} dd
        WHERE 1=1 ${dateFilter}
        GROUP BY dd.linevi
        ORDER BY count DESC
      `;

      const lineviResult = await client.query(lineviQuery, params);

      // Get by defect type
      const defectQuery = `
        SELECT
          dd.defect_id,
          d.name as defect_name,
          COUNT(*) as count,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE 1=1 ${dateFilter}
        GROUP BY dd.defect_id, d.name
        ORDER BY count DESC
        LIMIT 10
      `;

      const defectResult = await client.query(defectQuery, params);

      // Get top inspectors
      const inspectorQuery = `
        SELECT
          dd.inspector,
          COUNT(*) as count,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty
        FROM ${this.config.tableName} dd
        WHERE 1=1 ${dateFilter}
        GROUP BY dd.inspector
        ORDER BY count DESC
        LIMIT 10
      `;

      const inspectorResult = await client.query(inspectorQuery, params);

      // Build summary object
      const summary: DefectDataSummary = {
        total_records: parseInt(basicStats.total_records),
        today_records: parseInt(basicStats.today_records),
        this_week_records: parseInt(basicStats.this_week_records),
        this_month_records: parseInt(basicStats.this_month_records),
        total_ng_qty: parseInt(basicStats.total_ng_qty),
        latest_record_at: basicStats.latest_record_at,
        by_station: {},
        by_linevi: {},
        by_defect_type: {},
        top_inspectors: []
      };

      // Process station data
      stationResult.rows.forEach(row => {
        summary.by_station[row.station] = {
          count: parseInt(row.count),
          total_ng_qty: parseInt(row.total_ng_qty),
          defect_types: row.defect_types.filter((type: string) => type !== null)
        };
      });

      // Process linevi data
      lineviResult.rows.forEach(row => {
        summary.by_linevi[row.linevi] = {
          count: parseInt(row.count),
          total_ng_qty: parseInt(row.total_ng_qty)
        };
      });

      // Process defect type data
      defectResult.rows.forEach(row => {
        summary.by_defect_type[row.defect_id] = {
          count: parseInt(row.count),
          total_ng_qty: parseInt(row.total_ng_qty),
          defect_name: row.defect_name
        };
      });

      // Process inspector data
      summary.top_inspectors = inspectorResult.rows.map(row => ({
        inspector: row.inspector,
        count: parseInt(row.count),
        total_ng_qty: parseInt(row.total_ng_qty)
      }));

      return summary;
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data trends for charts
   */
  async getTrends(days: number = 7): Promise<DefectDataTrend[]> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          DATE(dd.defect_date) as date,
          COUNT(*) as count,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty,
          COUNT(DISTINCT dd.inspection_no) as unique_inspections,
          COUNT(DISTINCT dd.defect_id) as unique_defect_types
        FROM ${this.config.tableName} dd
        WHERE dd.defect_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(dd.defect_date)
        ORDER BY date DESC
      `;

      const result = await client.query(query);
      return result.rows.map(row => ({
        date: new Date(row.date),
        count: parseInt(row.count),
        total_ng_qty: parseInt(row.total_ng_qty),
        unique_inspections: parseInt(row.unique_inspections),
        unique_defect_types: parseInt(row.unique_defect_types)
      }));
    } finally {
      client.release();
    }
  }

  /**
   * Get inspector performance data
   */
  async getInspectorPerformance(inspector: string): Promise<InspectorPerformance | null> {
    const client = await this.db.connect();

    try {
      const query = `
        SELECT
          dd.inspector,
          COUNT(*) as total_records,
          COALESCE(SUM(dd.ng_qty), 0) as total_ng_qty,
          COUNT(DISTINCT dd.defect_id) as unique_defects_found,
          array_agg(DISTINCT dd.station) as stations_covered,
          array_agg(DISTINCT dd.linevi) as lines_covered,
          AVG(dd.ng_qty) as avg_ng_per_record,
          MAX(dd.defect_date) as latest_record_at
        FROM ${this.config.tableName} dd
        WHERE dd.inspector = $1  
        GROUP BY dd.inspector
      `;

      const result = await client.query(query, [inspector]);
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        inspector: row.inspector,
        total_records: parseInt(row.total_records),
        total_ng_qty: parseInt(row.total_ng_qty),
        unique_defects_found: parseInt(row.unique_defects_found),
        stations_covered: row.stations_covered,
        lines_covered: row.lines_covered,
        avg_ng_per_record: parseFloat(row.avg_ng_per_record),
        latest_record_at: new Date(row.latest_record_at)
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check if inspection number exists
   *
   * Validates inspection number uniqueness
   */
  async inspectionNumberExists(inspectionNo: string): Promise<boolean> {
    const client = await this.db.connect();

    try {
      const query = 'SELECT COUNT(*) as count FROM ${this.config.tableName} WHERE inspection_no = $1  ';
      const result = await client.query(query, [inspectionNo]);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Validate defect ID exists
   *
   * Ensures defect_id references a valid defect
   */
  async validateDefectId(defectId: number): Promise<boolean> {
    const client = await this.db.connect();

    try {
      const query = 'SELECT COUNT(*) as count FROM defects WHERE id = $1  ';
      const result = await client.query(query, [defectId]);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Get defect data by multiple filters
   *
   * Enhanced filtering for complex queries
   */
  async getByFilters(filters: DefectDataQueryOptions): Promise<{ data: DefectData[]; total: number }> {
    const client = await this.db.connect();

    try {
      let whereConditions: string[] = [];
      let params: any[] = [];
      let paramCount = 0;

      // Build WHERE clause dynamically
      if (filters.inspection_no) {
        whereConditions.push(`dd.inspection_no = $${++paramCount}`);
        params.push(filters.inspection_no);
      }

      if (filters.station) {
        whereConditions.push(`dd.station = $${++paramCount}`);
        params.push(filters.station);
      }

      if (filters.linevi) {
        whereConditions.push(`dd.linevi = $${++paramCount}`);
        params.push(filters.linevi);
      }

      if (filters.inspector) {
        whereConditions.push(`dd.inspector = $${++paramCount}`);
        params.push(filters.inspector);
      }

      if (filters.defect_id) {
        whereConditions.push(`dd.defect_id = $${++paramCount}`);
        params.push(filters.defect_id);
      }

      if (filters.defect_date_from) {
        whereConditions.push(`dd.defect_date >= $${++paramCount}`);
        params.push(filters.defect_date_from);
      }

      if (filters.defect_date_to) {
        whereConditions.push(`dd.defect_date <= $${++paramCount}`);
        params.push(filters.defect_date_to);
      }

      if (filters.ng_qty_min !== undefined) {
        whereConditions.push(`dd.ng_qty >= $${++paramCount}`);
        params.push(filters.ng_qty_min);
      }

      if (filters.ng_qty_max !== undefined) {
        whereConditions.push(`dd.ng_qty <= $${++paramCount}`);
        params.push(filters.ng_qty_max);
      }

      // Date shortcuts
      if (filters.today) {
        whereConditions.push(`dd.defect_date >= CURRENT_DATE`);
      }

      if (filters.yesterday) {
        whereConditions.push(`dd.defect_date >= CURRENT_DATE - INTERVAL '1 day' AND dd.defect_date < CURRENT_DATE`);
      }

      if (filters.this_week) {
        whereConditions.push(`dd.defect_date >= date_trunc('week', CURRENT_DATE)`);
      }

      if (filters.this_month) {
        whereConditions.push(`dd.defect_date >= date_trunc('month', CURRENT_DATE)`);
      }

      // Text search
      if (filters.search) {
        whereConditions.push(`(
          dd.inspection_no ILIKE $${++paramCount} OR
          dd.qc_name ILIKE $${++paramCount} OR
          dd.inspector ILIKE $${++paramCount} OR
          dd.station ILIKE $${++paramCount}
        )`);
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.config.tableName} dd
        ${whereClause}
      `;

      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Get data with pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 50, 500);
      const offset = (page - 1) * limit;

      const sortBy = filters.sortBy || 'defect_date';
      const sortOrder = filters.sortOrder || 'DESC';

      const dataQuery = `
        SELECT
          dd.*,
          d.name as defect_name,
          d.description as defect_description
        FROM ${this.config.tableName} dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        ${whereClause}
        ORDER BY dd.${sortBy} ${sortOrder}
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      params.push(limit, offset);

      const dataResult = await client.query(dataQuery, params);
      const data = dataResult.rows.map(row => this.transformRowToEntity(row));

      return { data, total };
    } finally {
      client.release();
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Transform database row to DefectData entity
   */
  private transformRowToEntity(row: any): DefectData {
    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      mbr_name: row.mbr_name,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      is_active: true,
      created_by: row.created_by,
      updated_by: row.updated_by,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  /**
   * Transform database row to DefectData entity
   */
  private transformRowToDefectDetail(row: any): DefectDetail {
    // Transform image_urls: if it's already an array, use it; otherwise parse or default to empty array
    let imageUrls: string[] = [];
    if (row.image_urls) {
      if (Array.isArray(row.image_urls)) {
        // Already an array from PostgreSQL
        imageUrls = row.image_urls;
      } else if (typeof row.image_urls === 'string') {
        try {
          // Try to parse if it's a JSON string
          imageUrls = JSON.parse(row.image_urls);
        } catch (e) {
          // If parse fails, treat as single URL
          imageUrls = [row.image_urls];
        }
      }
    }

    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      qclead_fullname: row.qclead_fullname,
      mbr_name: row.mbr_name,
      mbr_fullname: row.mbr_fullname,
      inspector_fullname: row.inspector_fullname,
      qc_fullname: row.qc_fullname,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      defect_group: row.defect_group,
      defect_name: row.defect_name,
      defect_description: row.defect_description,
      defect_detail: row.defect_detail,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      created_by: row.created_by,
      created_at: row.created_at,
      image_urls: imageUrls
    };
  }

    /**
   * Transform database row to DefectData Email entity
   */
  private transformRowToDefectEmail(row: any): DefectEmail {
    // Transform image_urls: if it's already an array, use it; otherwise parse or default to empty array
    let imageUrls: string[] = [];
    if (row.image_urls) {
      if (Array.isArray(row.image_urls)) {
        // Already an array from PostgreSQL
        imageUrls = row.image_urls;
      } else if (typeof row.image_urls === 'string') {
        try {
          // Try to parse if it's a JSON string
          imageUrls = JSON.parse(row.image_urls);
        } catch (e) {
          // If parse fails, treat as single URL
          imageUrls = [row.image_urls];
        }
      }
    }

    return {
      id: row.id,
      inspection_no: row.inspection_no,
      defect_date: new Date(row.defect_date),
      qc_name: row.qc_name,
      qclead_name: row.qclead_name,
      qclead_fullname: row.qclead_fullname,
      mbr_name: row.mbr_name,
      mbr_fullname: row.mbr_fullname,
      inspector_fullname: row.inspector_fullname,
      qc_fullname: row.qc_fullname,
      linevi: row.linevi,
      groupvi: row.groupvi,
      station: row.station,
      inspector: row.inspector,
      defect_id: row.defect_id,
      defect_group: row.defect_group,
      defect_name: row.defect_name,
      defect_description: row.defect_description,
      defect_detail: row.defect_detail,
      ng_qty: row.ng_qty || 0,
      trayno: row.trayno,
      tray_position: row.tray_position,
      color: row.color,
      created_by: row.created_by,
      created_at: row.created_at,
      tab: row.tab,
      lotno: row.lotno,
      model: row.model,
      version: row.version,
      itemno: row.itemno,
      shift: row.shift,
      fvilineno: row.fvilineno,
      image_urls: imageUrls
    };
  }

 
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a defect data model instance
 *
 * Provides dependency injection pattern for defect data model creation
 */
export function createDefectDataModel(db: Pool): DefectDataModel {
  return new DefectDataModel(db);
}

// ==================== DEFAULT EXPORT ====================

export default DefectDataModel;
