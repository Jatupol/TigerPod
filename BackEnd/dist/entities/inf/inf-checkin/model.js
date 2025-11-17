"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfCheckinModel = void 0;
const types_1 = require("./types");
class InfCheckinModel {
    constructor(db) {
        this.config = types_1.INF_CHECKIN_TABLE_CONFIG;
        this.db = db;
    }
    async getAll(queryParams = {}) {
        const { page = 1, limit = this.config.defaultLimit, username, usernameSearch, oprname, lineNoSearch, globalSearch, line_no_id, work_shift_id, group_code, team, status, createdOnFrom, createdOnTo, lineId, shiftId, search } = queryParams;
        try {
            console.log('🔧 InfCheckinModel.getAll called with params:', queryParams);
            const conditions = [];
            const params = [];
            let paramCount = 0;
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
            if (line_no_id || lineId) {
                paramCount++;
                conditions.push(`line_no_id = $${paramCount}`);
                params.push(line_no_id || lineId);
            }
            if (work_shift_id || shiftId) {
                paramCount++;
                conditions.push(`work_shift_id = $${paramCount}`);
                params.push(work_shift_id || shiftId);
            }
            if (group_code) {
                paramCount++;
                conditions.push(`group_code = $${paramCount}`);
                params.push(group_code);
            }
            if (team) {
                paramCount++;
                conditions.push(`team = $${paramCount}`);
                params.push(team);
            }
            if (status && status !== 'all') {
                if (status === 'working') {
                    conditions.push(`date_time_off_work IS NULL`);
                }
                else if (status === 'checked_out') {
                    conditions.push(`date_time_off_work IS NOT NULL`);
                }
            }
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
            const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.config.tableName}
        ${whereClause}
      `;
            const countResult = await this.db.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);
            const validLimit = Math.min(Math.max(1, limit), this.config.maxLimit);
            const validPage = Math.max(1, page);
            const offset = (validPage - 1) * validLimit;
            const totalPages = Math.ceil(total / validLimit);
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
            const data = dataResult.rows.map(row => ({
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
            const pagination = {
                page: validPage,
                limit: validLimit,
                total,
                totalPages,
                hasNext: validPage < totalPages,
                hasPrev: validPage > 1
            };
            return { data, pagination };
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getAll:', error);
            throw error;
        }
    }
    async getByUsername(username) {
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
            const data = result.rows.map(row => ({
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getByUsername:', error);
            throw error;
        }
    }
    async getByLineId(lineId) {
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
            const data = result.rows.map(row => ({
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getByLineId:', error);
            throw error;
        }
    }
    async getActiveWorkers() {
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
            const data = result.rows.map(row => ({
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getActiveWorkers:', error);
            throw error;
        }
    }
    async getStatistics() {
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
            const records = {
                totalRecords: parseInt(stats.total_records) || 0,
                totalToday: parseInt(stats.total_today) || 0,
                totalMonth: parseInt(stats.total_month) || 0,
                totalYear: parseInt(stats.total_year) || 0,
                lastSync: stats.last_sync ? stats.last_sync.toISOString() : undefined
            };
            console.log('✅ InfCheckinModel.getStatistics: Retrieved statistics', stats);
            return records;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getStatistics:', error);
            throw error;
        }
    }
    async getOperators(gr_code) {
        try {
            console.log('🔧 InfCheckinModel.getOperators called with gr_code:', gr_code);
            let whereClause = `
        WHERE username IS NOT NULL
          AND oprname IS NOT NULL
          AND username != ''
          AND oprname != ''
      `;
            const queryParams = [];
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
            const result = await this.db.query(query, queryParams);
            const operators = result.rows.map(row => ({
                username: row.username,
                oprname: row.oprname
            }));
            console.log(`✅ InfCheckinModel.getOperators: Retrieved ${operators.length} operators`);
            return operators;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getOperators:', error);
            throw error;
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfCheckinModel.getFilterOptions called');
            const queries = await Promise.all([
                this.db.query(`
          SELECT DISTINCT line_no_id
          FROM ${this.config.tableName}
          WHERE line_no_id IS NOT NULL
          ORDER BY line_no_id
          LIMIT 50
        `),
                this.db.query(`
          SELECT DISTINCT work_shift_id
          FROM ${this.config.tableName}
          WHERE work_shift_id IS NOT NULL
          ORDER BY work_shift_id
          LIMIT 50
        `),
                this.db.query(`
          SELECT DISTINCT group_code
          FROM ${this.config.tableName}
          WHERE group_code IS NOT NULL
          ORDER BY group_code
          LIMIT 50
        `),
                this.db.query(`
          SELECT DISTINCT team
          FROM ${this.config.tableName}
          WHERE team IS NOT NULL
          ORDER BY team
          LIMIT 50
        `)
            ]);
            const options = {
                lineIds: queries[0].rows.map(row => row.line_no_id),
                workShiftIds: queries[1].rows.map(row => row.work_shift_id),
                groupCodes: queries[2].rows.map(row => row.group_code),
                teams: queries[3].rows.map(row => row.team)
            };
            console.log('✅ InfCheckinModel.getFilterOptions: Retrieved options', options);
            return options;
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFilterOptions:', error);
            throw error;
        }
    }
    async getFVILineMapping(params) {
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFVILineMapping:', error);
            throw error;
        }
    }
    async getFVILinesByDate(date) {
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.getFVILinesByDate:', error);
            throw error;
        }
    }
    async searchRecords(searchParams) {
        try {
            console.log('🔍 InfCheckinModel.searchRecords called with params:', searchParams);
            const conditions = [];
            const params = [];
            let paramCount = 0;
            const { searchTerm, username, oprname, lineId, groupCode, team, dateFrom, dateTo } = searchParams;
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
            const data = result.rows.map(row => ({
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
        }
        catch (error) {
            console.error('❌ Error in InfCheckinModel.searchRecords:', error);
            throw error;
        }
    }
}
exports.InfCheckinModel = InfCheckinModel;
exports.default = InfCheckinModel;
