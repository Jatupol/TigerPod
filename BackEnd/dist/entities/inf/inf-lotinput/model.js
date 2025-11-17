"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfLotInputModel = void 0;
const types_1 = require("./types");
class InfLotInputModel {
    constructor(db) {
        this.config = types_1.INF_LOTINPUT_TABLE_CONFIG;
        this.db = db;
    }
    async getAll(queryParams = {}) {
        const { page = 1, limit = this.config.defaultLimit, lotNoSearch, itemNoSearch, globalSearch, partSite, lineNo, model, version, status, inputDateFrom, inputDateTo, lotNo, itemNo, search } = queryParams;
        try {
            const conditions = [];
            const params = [];
            let paramCount = 0;
            if (lotNoSearch || lotNo) {
                paramCount++;
                conditions.push(`lotno ILIKE $${paramCount}`);
                params.push(`%${(lotNoSearch || lotNo)}%`);
            }
            if (itemNoSearch || itemNo) {
                paramCount++;
                conditions.push(`itemno ILIKE $${paramCount}`);
                params.push(`%${(itemNoSearch || itemNo)}%`);
            }
            if (globalSearch || search) {
                paramCount++;
                const searchTerm = globalSearch || search;
                const searchConditions = this.config.searchableFields.map(field => `${field} ILIKE $${paramCount}`).join(' OR ');
                conditions.push(`(${searchConditions})`);
                params.push(`%${searchTerm}%`);
            }
            if (partSite) {
                paramCount++;
                conditions.push(`partsite = $${paramCount}`);
                params.push(partSite);
            }
            if (lineNo) {
                paramCount++;
                conditions.push(`lineno = $${paramCount}`);
                params.push(lineNo);
            }
            if (model) {
                paramCount++;
                conditions.push(`model = $${paramCount}`);
                params.push(model);
            }
            if (version) {
                paramCount++;
                conditions.push(`version = $${paramCount}`);
                params.push(version);
            }
            if (inputDateFrom) {
                paramCount++;
                conditions.push(`inputdate >= $${paramCount}`);
                params.push(inputDateFrom);
            }
            if (inputDateTo) {
                paramCount++;
                conditions.push(`inputdate <= $${paramCount}::date + INTERVAL '1 day' - INTERVAL '1 second'`);
                params.push(inputDateTo);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const countQuery = `
        SELECT COUNT(*) as total
        FROM ${this.config.tableName}
        ${whereClause}
      `;
            const countResult = await this.db.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);
            const offset = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            const dataQuery = `
        SELECT
          id,
          lotno,
          partsite,
          lineno,
          itemno,
          model,
          version,
          inputdate,
          finish_on,
          imported_at
        FROM ${this.config.tableName}
        ${whereClause}
        ORDER BY inputdate DESC, imported_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
            params.push(limit, offset);
            const dataResult = await this.db.query(dataQuery, params);
            const records = dataResult.rows.map(row => this.mapRowToRecord(row));
            const pagination = {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            };
            return {
                data: records,
                pagination
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getAll:', error);
            throw new Error(`Failed to retrieve inf lot input data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByLotNumber(lotNo) {
        try {
            const query = `
        SELECT
          id,
          lotno,
          partsite,
          lineno,
          itemno,
          model,
          version,
          inputdate,
          finish_on,
          imported_at
        FROM ${this.config.tableName}
        WHERE lotno = $1
        ORDER BY inputdate DESC, imported_at DESC
      `;
            const result = await this.db.query(query, [lotNo]);
            return result.rows.map(row => this.mapRowToRecord(row));
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getByLotNumber:', error);
            throw new Error(`Failed to retrieve lot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getStatistics() {
        try {
            const query = `
        SELECT
            COUNT(*) AS total_records,
            COUNT(CASE WHEN inputdate IS NOT NULL AND inputdate::date = CURRENT_DATE THEN 1 END) AS total_today,
            COUNT(CASE WHEN inputdate IS NOT NULL 
                        AND date_trunc('month', inputdate) = date_trunc('month', CURRENT_DATE) 
                  THEN 1 END) AS total_month,
            COUNT(CASE WHEN inputdate IS NOT NULL 
                        AND date_trunc('year', inputdate) = date_trunc('year', CURRENT_DATE) 
                  THEN 1 END) AS total_year,
            MAX(imported_at) AS last_sync
        FROM ${this.config.tableName}
      `;
            const result = await this.db.query(query);
            const stats = result.rows[0];
            return {
                totalRecords: parseInt(stats.total_records) || 0,
                totalToday: parseInt(stats.total_today) || 0,
                totalMonth: parseInt(stats.total_month) || 0,
                totalYear: parseInt(stats.total_year) || 0,
                lastSync: stats.last_sync ? stats.last_sync.toISOString() : undefined
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getStatistics:', error);
            throw new Error(`Failed to retrieve statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFilterOptions() {
        try {
            const query = `
        SELECT
          ARRAY_AGG(DISTINCT partsite ORDER BY partsite) FILTER (WHERE partsite IS NOT NULL) as part_sites,
          ARRAY_AGG(DISTINCT lineno ORDER BY lineno) FILTER (WHERE lineno IS NOT NULL) as line_nos,
          ARRAY_AGG(DISTINCT model ORDER BY model) FILTER (WHERE model IS NOT NULL) as models,
          ARRAY_AGG(DISTINCT version ORDER BY version) FILTER (WHERE version IS NOT NULL) as versions
        FROM ${this.config.tableName}
      `;
            const result = await this.db.query(query);
            const options = result.rows[0];
            return {
                partSites: options.part_sites || [],
                lineNos: options.line_nos || [],
                models: options.models || [],
                versions: options.versions || []
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputModel.getFilterOptions:', error);
            return {
                partSites: [],
                lineNos: [],
                models: [],
                versions: []
            };
        }
    }
    mapRowToRecord(row) {
        return {
            id: row.id || '',
            LotNo: row.lotno || '',
            PartSite: row.partsite || '',
            LineNo: row.lineno || '',
            ItemNo: row.itemno || '',
            Model: row.model || '',
            Version: row.version || '',
            InputDate: row.inputdate ? new Date(row.inputdate).toISOString() : '',
            FinishOn: row.finish_on ? new Date(row.finish_on).toISOString() : null,
            imported_at: row.imported_at ? new Date(row.imported_at).toISOString() : ''
        };
    }
}
exports.InfLotInputModel = InfLotInputModel;
exports.default = InfLotInputModel;
