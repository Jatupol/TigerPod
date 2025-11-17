"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamplingReasonModel = void 0;
exports.createSamplingReasonModel = createSamplingReasonModel;
const generic_model_1 = require("../../generic/entities/serial-id-entity/generic-model");
const types_1 = require("./types");
class SamplingReasonModel extends generic_model_1.GenericSerialIdModel {
    constructor(db) {
        super(db, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
    }
    async findAllWithDescriptionFilter(options) {
        const { page = 1, limit = this.config.defaultLimit, sortBy = 'name', sortOrder = 'ASC', search, isActive = true, hasDescription } = options;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (isActive !== undefined) {
            conditions.push(`is_active = ${paramIndex}`);
            params.push(isActive);
            paramIndex++;
        }
        if (hasDescription !== undefined) {
            if (hasDescription) {
                conditions.push("description IS NOT NULL AND description != ''");
            }
            else {
                conditions.push("description IS NULL OR description = ''");
            }
        }
        if (search && search.trim()) {
            const searchConditions = this.config.searchableFields.map(field => `${field} ILIKE ${paramIndex}`).join(' OR ');
            if (searchConditions) {
                conditions.push(`(${searchConditions})`);
                params.push(`%${search.trim()}%`);
                paramIndex++;
            }
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const allowedFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'];
        const validSortField = allowedFields.includes(sortBy) ? sortBy : 'name';
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const dataQuery = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
    `;
        params.push(limit, offset);
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        const countParams = params.slice(0, paramIndex - 2);
        try {
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, params),
                this.db.query(countQuery, countParams)
            ]);
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to find sampling reasons: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async isNameUnique(name, excludeId) {
        try {
            let query = `
        SELECT COUNT(*) as count
        FROM ${this.config.tableName}
        WHERE LOWER(name) = LOWER($1)
      `;
            const params = [name];
            if (excludeId) {
                query += ` AND id != $2`;
                params.push(excludeId);
            }
            const result = await this.db.query(query, params);
            return parseInt(result.rows[0].count) === 0;
        }
        catch (error) {
            console.error('Error checking name uniqueness:', error);
            throw new Error('Failed to check name uniqueness');
        }
    }
}
exports.SamplingReasonModel = SamplingReasonModel;
function createSamplingReasonModel(db) {
    return new SamplingReasonModel(db);
}
exports.default = SamplingReasonModel;
