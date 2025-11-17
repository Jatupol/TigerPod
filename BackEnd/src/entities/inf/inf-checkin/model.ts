// server/src/entities/inf/inf-checkin/model.ts
// ===== SIMPLIFIED INF CHECKIN MODEL =====
// Data Display Only - Search and Retrieval Focus
// Sampling Inspection Control System - Simplified Read-Only Model

import { Pool } from 'pg';
import {
  InfCheckinRecord,
  InfCheckinQueryParams,
  PaginationInfo,
  CheckinStats,
  FilterOptions,
  INF_CHECKIN_TABLE_CONFIG
} from './types';

/**
 * Simplified INF CheckIn Model - Focus on data retrieval and search only
 */
export class InfCheckinModel {
  private db: Pool;
  private config = INF_CHECKIN_TABLE_CONFIG;

  constructor(db: Pool) {
    this.db = db;
  }

  // ==================== CORE DATA RETRIEVAL ====================

  /**
   * Get all records with pagination and filtering
   */
  async getAll(queryParams: InfCheckinQueryParams = {}): Promise<{
    data: InfCheckinRecord[];
    pagination?: PaginationInfo;
  }> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      username,
      usernameSearch,
      oprname,
      lineNoSearch,
      globalSearch,
      line_no_id,
      work_shift_id,
      group_code,
      team,
      status,
      createdOnFrom,
      createdOnTo,
      // Legacy support
      lineId,
      shiftId,
      search
    } = queryParams;

    try {
      console.log('🔧 InfCheckinModel.getAll called with params:', queryParams);

      // Build dynamic WHERE conditions
      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      // Search filters
      const searchTerm = globalSearch || search || usernameSearch || lineNoSearch;
      if (searchTerm && searchTerm.trim()) {
        paramCount++;
        conditions.push(`(
          username ILIKE $${paramCount} OR
          oprname ILIKE $${paramCount} OR
          line_no_id ILIKE $${paramCount} OR
          work_shift_id ILIKE $${paramCount} OR
          group_code ILIKE $${paramCount} OR
          team ILIKE $${paramCount}
        )`);
        params.push(`%${searchTerm}%`);
      }

      // Username filter
      if (username && username.trim()) {
        paramCount++;
        conditions.push(`username ILIKE $${paramCount}`);
        params.push(`%${username}%`);
      }

      // Operator name filter
      if (oprname && oprname.trim()) {
        paramCount++;
        conditions.push(`oprname ILIKE $${paramCount}`);
        params.push(`%${oprname}%`);
      }

      // Line ID filter
      if (line_no_id || lineId) {
        paramCount++;
        conditions.push(`line_no_id = $${paramCount}`);
        params.push(line_no_id || lineId);
      }

      // Work shift filter
      if (work_shift_id || shiftId) {
        paramCount++;
        conditions.push(`work_shift_id = $${paramCount}`);
        params.push(work_shift_id || shiftId);
      }

      // Group code filter
      if (group_code) {
        paramCount++;
        conditions.push(`group_code = $${paramCount}`);
        params.push(group_code);
      }

      // Team filter
      if (team) {
        paramCount++;
        conditions.push(`team = $${paramCount}`);
        params.push(team);
      }

      // Work status filter
      if (status && status !== 'all') {
        if (status === 'working') {
          conditions.push(`date_time_off_work IS NULL`);
        } else if (status === 'checked_out') {
          conditions.push(`date_time_off_work IS NOT NULL`);
        }
      }

      // Date filters
      if (createdOnFrom) {
        paramCount++;
        conditions.push(`created_on >= $${paramCount}`);
        params.push(createdOnFrom);
      }

      if (createdOnTo) {
        paramCount++;
        conditions.push(`created_on <= $${paramCount}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
        params.push(createdOnTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.config.tableName}
        ${whereClause}
      `;

      const countResult = await this.db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Calculate pagination
      const validLimit = Math.min(Math.max(1, limit), this.config.maxLimit);
      const validPage = Math.max(1, page);
      const offset = (validPage - 1) * validLimit;
      const totalPages = Math.ceil(total / validLimit);

      // Get paginated data
      const dataQuery = `
        SELECT
          id,
          line_no_id,
          work_shift_id,
          gr_code,
          username,
          oprname,
          created_on,
          checked_out,
          date_time_start_work,
          date_time_off_work,
          time_off_work,
          time_start_work,
          group_code,
          team,
          NOW() as imported_at
        FROM ${this.config.tableName}
        ${whereClause}
        ORDER BY created_on DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      params.push(validLimit, offset);

      const dataResult = await this.db.query(dataQuery, params);

      // Format data to match frontend interface
      const data: InfCheckinRecord[] = dataResult.rows.map(row => ({
        id: row.id,
        line_no_id: row.line_no_id,
        work_shift_id: row.work_shift_id,
        gr_code: row.gr_code,
        username: row.username,
        oprname: row.oprname,
        created_on: row.created_on ? row.created_on.toISOString() : null,
        checked_out: row.checked_out ? row.checked_out.toISOString() : null,
        date_time_start_work: row.date_time_start_work ? row.date_time_start_work.toISOString() : null,
        date_time_off_work: row.date_time_off_work ? row.date_time_off_work.toISOString() : null,
        time_off_work: row.time_off_work,
        time_start_work: row.time_start_work,
        group_code: row.group_code,
        team: row.team,
        imported_at: row.imported_at ? row.imported_at.toISOString() : null
      }));

      console.log(`✅ InfCheckinModel.getAll: Retrieved ${data.length} records`);

      const pagination: PaginationInfo = {
        page: validPage,
        limit: validLimit,
        total,
        totalPages,
        hasNext: validPage < totalPages,
        hasPrev: validPage > 1
      };

      return { data, pagination };

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getAll:', error);
      throw error;
    }
  }

  /**
   * Get records by username
   */
  async getByUsername(username: string): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getByUsername called:', { username });

      const query = `
        SELECT
          id,
          line_no_id,
          work_shift_id,
          gr_code,
          username,
          oprname,
          created_on,
          checked_out,
          date_time_start_work,
          date_time_off_work,
          time_off_work,
          time_start_work,
          group_code,
          team,
          NOW() as imported_at
        FROM ${this.config.tableName}
        WHERE username ILIKE $1
        ORDER BY created_on DESC
        LIMIT 100
      `;

      const result = await this.db.query(query, [`%${username}%`]);

      const data: InfCheckinRecord[] = result.rows.map(row => ({
        id: row.id,
        line_no_id: row.line_no_id,
        work_shift_id: row.work_shift_id,
        gr_code: row.gr_code,
        username: row.username,
        oprname: row.oprname,
        created_on: row.created_on ? row.created_on.toISOString() : null,
        checked_out: row.checked_out ? row.checked_out.toISOString() : null,
        date_time_start_work: row.date_time_start_work ? row.date_time_start_work.toISOString() : null,
        date_time_off_work: row.date_time_off_work ? row.date_time_off_work.toISOString() : null,
        time_off_work: row.time_off_work,
        time_start_work: row.time_start_work,
        group_code: row.group_code,
        team: row.team,
        imported_at: row.imported_at ? row.imported_at.toISOString() : null
      }));

      console.log(`✅ InfCheckinModel.getByUsername: Found ${data.length} records`);
      return data;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getByUsername:', error);
      throw error;
    }
  }

  /**
   * Get records by line ID
   */
  async getByLineId(lineId: string): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getByLineId called:', { lineId });

      const query = `
        SELECT
          id,
          line_no_id,
          work_shift_id,
          gr_code,
          username,
          oprname,
          created_on,
          checked_out,
          date_time_start_work,
          date_time_off_work,
          time_off_work,
          time_start_work,
          group_code,
          team,
          NOW() as imported_at
        FROM ${this.config.tableName}
        WHERE line_no_id = $1
        ORDER BY created_on DESC
        LIMIT 100
      `;

      const result = await this.db.query(query, [lineId]);

      const data: InfCheckinRecord[] = result.rows.map(row => ({
        id: row.id,
        line_no_id: row.line_no_id,
        work_shift_id: row.work_shift_id,
        gr_code: row.gr_code,
        username: row.username,
        oprname: row.oprname,
        created_on: row.created_on ? row.created_on.toISOString() : null,
        checked_out: row.checked_out ? row.checked_out.toISOString() : null,
        date_time_start_work: row.date_time_start_work ? row.date_time_start_work.toISOString() : null,
        date_time_off_work: row.date_time_off_work ? row.date_time_off_work.toISOString() : null,
        time_off_work: row.time_off_work,
        time_start_work: row.time_start_work,
        group_code: row.group_code,
        team: row.team,
        imported_at: row.imported_at ? row.imported_at.toISOString() : null
      }));

      console.log(`✅ InfCheckinModel.getByLineId: Found ${data.length} records`);
      return data;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getByLineId:', error);
      throw error;
    }
  }

  /**
   * Get currently active workers (no check-out time)
   */
  async getActiveWorkers(): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔧 InfCheckinModel.getActiveWorkers called');

      const query = `
        SELECT
          id,
          line_no_id,
          work_shift_id,
          gr_code,
          username,
          oprname,
          created_on,
          checked_out,
          date_time_start_work,
          date_time_off_work,
          time_off_work,
          time_start_work,
          group_code,
          team,
          NOW() as imported_at
        FROM ${this.config.tableName}
        WHERE date_time_off_work IS NULL
        ORDER BY created_on DESC
        LIMIT 200
      `;

      const result = await this.db.query(query);

      const data: InfCheckinRecord[] = result.rows.map(row => ({
        id: row.id,
        line_no_id: row.line_no_id,
        work_shift_id: row.work_shift_id,
        gr_code: row.gr_code,
        username: row.username,
        oprname: row.oprname,
        created_on: row.created_on ? row.created_on.toISOString() : null,
        checked_out: row.checked_out ? row.checked_out.toISOString() : null,
        date_time_start_work: row.date_time_start_work ? row.date_time_start_work.toISOString() : null,
        date_time_off_work: row.date_time_off_work ? row.date_time_off_work.toISOString() : null,
        time_off_work: row.time_off_work,
        time_start_work: row.time_start_work,
        group_code: row.group_code,
        team: row.team,
        imported_at: row.imported_at ? row.imported_at.toISOString() : null
      }));

      console.log(`✅ InfCheckinModel.getActiveWorkers: Found ${data.length} active workers`);
      return data;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getActiveWorkers:', error);
      throw error;
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<CheckinStats> {
    try {
      console.log('📊 InfCheckinModel.getStatistics called');

        const query = `
          SELECT
              COUNT(*) AS total_records,
              COUNT(CASE WHEN created_on IS NOT NULL AND created_on::date = CURRENT_DATE THEN 1 END) AS total_today,
              COUNT(CASE WHEN created_on IS NOT NULL 
                          AND date_trunc('month', created_on) = date_trunc('month', CURRENT_DATE) 
                    THEN 1 END) AS total_month,
              COUNT(CASE WHEN created_on IS NOT NULL 
                          AND date_trunc('year', created_on) = date_trunc('year', CURRENT_DATE) 
                    THEN 1 END) AS total_year,
              MAX(imported_at) AS last_sync
          FROM ${this.config.tableName}
        `;
  
        const result = await this.db.query(query);
        const stats = result.rows[0];

  
      const records: CheckinStats = {
        totalRecords: parseInt(stats.total_records) || 0,
        totalToday: parseInt(stats.total_today) || 0,
        totalMonth: parseInt(stats.total_month) || 0,
        totalYear: parseInt(stats.total_year) || 0,
        lastSync: stats.last_sync ? stats.last_sync.toISOString() : undefined
      };

      console.log('✅ InfCheckinModel.getStatistics: Retrieved statistics', stats);
      return records;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getStatistics:', error);
      throw error;
    }
  }

  /**
   * Get unique operators (username and oprname) for autocomplete
   * @param gr_code - Optional group code filter (if blank, show all)
   */
  async getOperators(gr_code?: string): Promise<Array<{ username: string; oprname: string }>> {
    try {
      console.log('🔧 InfCheckinModel.getOperators called with gr_code:', gr_code);

      // Build WHERE clause based on gr_code parameter
      let whereClause = `
        WHERE username IS NOT NULL
          AND oprname IS NOT NULL
          AND username != ''
          AND oprname != ''
      `;

      const queryParams: any[] = [];

      // Add gr_code filter if provided and not blank
      if (gr_code && gr_code.trim() !== '') {
        whereClause += ` AND gr_code = $1`;
        queryParams.push(gr_code.trim());
      }

      const query = `
        SELECT DISTINCT username, max(oprname) oprname
        FROM ${this.config.tableName}
        ${whereClause}
        GROUP BY username
        ORDER BY username
      `;

      //console.log('🔍 Query:', query);
      //console.log('🔍 Parameters:', queryParams);

      const result = await this.db.query(query, queryParams);

      const operators = result.rows.map(row => ({
        username: row.username,
        oprname: row.oprname
      }));

      console.log(`✅ InfCheckinModel.getOperators: Retrieved ${operators.length} operators`);
      return operators;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getOperators:', error);
      throw error;
    }
  }


  
  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      console.log('🔧 InfCheckinModel.getFilterOptions called');

      const queries = await Promise.all([
        // Unique line IDs
        this.db.query(`
          SELECT DISTINCT line_no_id
          FROM ${this.config.tableName}
          WHERE line_no_id IS NOT NULL
          ORDER BY line_no_id
          LIMIT 50
        `),

        // Unique work shift IDs
        this.db.query(`
          SELECT DISTINCT work_shift_id
          FROM ${this.config.tableName}
          WHERE work_shift_id IS NOT NULL
          ORDER BY work_shift_id
          LIMIT 50
        `),

        // Unique group codes
        this.db.query(`
          SELECT DISTINCT group_code
          FROM ${this.config.tableName}
          WHERE group_code IS NOT NULL
          ORDER BY group_code
          LIMIT 50
        `),

        // Unique teams
        this.db.query(`
          SELECT DISTINCT team
          FROM ${this.config.tableName}
          WHERE team IS NOT NULL
          ORDER BY team
          LIMIT 50
        `)
      ]);

      const options: FilterOptions = {
        lineIds: queries[0].rows.map(row => row.line_no_id),
        workShiftIds: queries[1].rows.map(row => row.work_shift_id),
        groupCodes: queries[2].rows.map(row => row.group_code),
        teams: queries[3].rows.map(row => row.team)
      };

      console.log('✅ InfCheckinModel.getFilterOptions: Retrieved options', options);
      return options;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFilterOptions:', error);
      throw error;
    }
  }

  /**
   * Get FVI line mapping for production line visualization
   * Query workers by line, date, and shift for station mapping
   */
  async getFVILineMapping(params: {
    line: string;
    date: string;
    shift: string;
  }): Promise<Array<{
    gr_code: string;
    group_code: string;
    username: string;
    oprname?: string;
  }>> {
    try {
      console.log('🔧 InfCheckinModel.getFVILineMapping called with params:', params);

      const { line, date, shift } = params;

      const query = `
        SELECT
          gr_code,
          group_code,
          username,
          oprname
        FROM ${this.config.tableName}
        WHERE line_no_id = $1
          AND date_time_start_work::date = $2
          AND work_shift_id = $3
        ORDER BY gr_code
      `;

      const result = await this.db.query(query, [line, date, shift]);

      const mappings = result.rows.map(row => ({
        gr_code: row.gr_code,
        group_code: row.group_code,
        username: row.username
      }));

      console.log(`✅ InfCheckinModel.getFVILineMapping: Found ${mappings.length} station mappings`);
      return mappings;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFVILineMapping:', error);
      throw error;
    }
  }

  /**
   * Get list of FVI lines by date
   * Returns unique line numbers that have check-in data for the specified date
   */
  async getFVILinesByDate(date: string): Promise<Array<{ line_no_id: string }>> {
    try {
      console.log('🔧 InfCheckinModel.getFVILinesByDate called with date:', date);

      const query = `
        SELECT Line_no_id
        FROM ${this.config.tableName}
        WHERE date_time_start_work::date = $1
        GROUP BY Line_no_id
        ORDER BY Line_no_id
      `;

      const result = await this.db.query(query, [date]);

      const lines = result.rows.map(row => ({
        line_no_id: row.line_no_id
      }));

      console.log(`✅ InfCheckinModel.getFVILinesByDate: Found ${lines.length} lines`);
      return lines;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.getFVILinesByDate:', error);
      throw error;
    }
  }

  /**
   * Search records by multiple criteria
   */
  async searchRecords(searchParams: {
    searchTerm?: string;
    username?: string;
    oprname?: string;
    lineId?: string;
    groupCode?: string;
    team?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<InfCheckinRecord[]> {
    try {
      console.log('🔍 InfCheckinModel.searchRecords called with params:', searchParams);

      const conditions: string[] = [];
      const params: any[] = [];
      let paramCount = 0;

      const {
        searchTerm,
        username,
        oprname,
        lineId,
        groupCode,
        team,
        dateFrom,
        dateTo
      } = searchParams;

      // Global search term
      if (searchTerm && searchTerm.trim()) {
        paramCount++;
        conditions.push(`(
          username ILIKE $${paramCount} OR
          oprname ILIKE $${paramCount} OR
          line_no_id ILIKE $${paramCount} OR
          group_code ILIKE $${paramCount} OR
          team ILIKE $${paramCount}
        )`);
        params.push(`%${searchTerm}%`);
      }

      // Specific field searches
      if (username && username.trim()) {
        paramCount++;
        conditions.push(`username ILIKE $${paramCount}`);
        params.push(`%${username}%`);
      }

      if (oprname && oprname.trim()) {
        paramCount++;
        conditions.push(`oprname ILIKE $${paramCount}`);
        params.push(`%${oprname}%`);
      }

      if (lineId && lineId.trim()) {
        paramCount++;
        conditions.push(`line_no_id = $${paramCount}`);
        params.push(lineId);
      }

      if (groupCode && groupCode.trim()) {
        paramCount++;
        conditions.push(`group_code = $${paramCount}`);
        params.push(groupCode);
      }

      if (team && team.trim()) {
        paramCount++;
        conditions.push(`team = $${paramCount}`);
        params.push(team);
      }

      // Date range
      if (dateFrom) {
        paramCount++;
        conditions.push(`created_on >= $${paramCount}`);
        params.push(dateFrom);
      }

      if (dateTo) {
        paramCount++;
        conditions.push(`created_on <= $${paramCount}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
        params.push(dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT
          id,
          line_no_id,
          work_shift_id,
          gr_code,
          username,
          oprname,
          created_on,
          checked_out,
          date_time_start_work,
          date_time_off_work,
          time_off_work,
          time_start_work,
          group_code,
          team,
          NOW() as imported_at
        FROM ${this.config.tableName}
        ${whereClause}
        ORDER BY created_on DESC
        LIMIT 100
      `;

      const result = await this.db.query(query, params);

      const data: InfCheckinRecord[] = result.rows.map(row => ({
        id: row.id,
        line_no_id: row.line_no_id,
        work_shift_id: row.work_shift_id,
        gr_code: row.gr_code,
        username: row.username,
        oprname: row.oprname,
        created_on: row.created_on ? row.created_on.toISOString() : null,
        checked_out: row.checked_out ? row.checked_out.toISOString() : null,
        date_time_start_work: row.date_time_start_work ? row.date_time_start_work.toISOString() : null,
        date_time_off_work: row.date_time_off_work ? row.date_time_off_work.toISOString() : null,
        time_off_work: row.time_off_work,
        time_start_work: row.time_start_work,
        group_code: row.group_code,
        team: row.team,
        imported_at: row.imported_at ? row.imported_at.toISOString() : null
      }));

      console.log(`✅ InfCheckinModel.searchRecords: Found ${data.length} matching records`);
      return data;

    } catch (error) {
      console.error('❌ Error in InfCheckinModel.searchRecords:', error);
      throw error;
    }
  }
}

export default InfCheckinModel;

/*
=== SIMPLIFIED INF CHECKIN MODEL FEATURES ===

SIMPLIFIED ARCHITECTURE:
✅ Direct model class without complex inheritance
✅ Simple method signatures matching inf-lotinput pattern
✅ Focus on data retrieval only
✅ No complex generic patterns or abstractions

CORE DATA OPERATIONS:
✅ getAll() - Paginated list with filtering
✅ getByUsername() - Find records by username
✅ getByLineId() - Find records by line ID
✅ getActiveWorkers() - Currently checked-in workers
✅ getStatistics() - Dashboard statistics
✅ getFilterOptions() - Dropdown options
✅ searchRecords() - Multi-criteria search

DATABASE OPERATIONS:
✅ Dynamic WHERE clause building
✅ Parameter sanitization for SQL injection prevention
✅ Proper pagination with LIMIT/OFFSET
✅ Date range filtering with proper timezone handling
✅ Field mapping to match frontend interface

MANUFACTURING FOCUS:
✅ Worker check-in/out tracking
✅ Production line monitoring
✅ Shift and team management
✅ Real-time active worker identification

The simplified model follows the exact same pattern as inf-lotinput
with direct SQL queries and consistent error handling.
*/