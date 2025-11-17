"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectModel = void 0;
exports.createDefectModel = createDefectModel;
const generic_model_1 = require("../../generic/entities/serial-id-entity/generic-model");
const types_1 = require("./types");
class DefectModel extends generic_model_1.GenericSerialIdModel {
    constructor(db) {
        super(db, types_1.DEFAULT_DEFECT_CONFIG);
    }
    async create(data, userId) {
        const now = new Date();
        const fields = ['name', 'description', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at'];
        const values = [
            data.name,
            data.description || '',
            data.is_active !== undefined ? data.is_active : true,
            userId,
            userId,
            now,
            now
        ];
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
        }
        catch (error) {
            console.error('❌ DefectModel.create - Error:', error);
            throw new Error(`Failed to create defect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async update(id, data, userId) {
        const now = new Date();
        const updates = [];
        const params = [];
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
        if (data.defect_group !== undefined) {
            updates.push(`defect_group = $${paramIndex}`);
            params.push(data.defect_group || null);
            paramIndex++;
        }
        updates.push(`updated_by = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
        updates.push(`updated_at = $${paramIndex}`);
        params.push(now);
        paramIndex++;
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
        }
        catch (error) {
            console.error('❌ DefectModel.update - Error:', error);
            throw new Error(`Failed to update defect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getByDefectGroup(defectGroup, options = {}) {
        console.log('🔧 DefectModel.getByDefectGroup - defect_group filter:', defectGroup);
        const client = await this.db.connect();
        try {
            const page = options.page || 1;
            const limit = options.limit || 50;
            const offset = (page - 1) * limit;
            const sortBy = options.sortBy || 'id';
            const sortOrder = options.sortOrder || 'desc';
            const conditions = [];
            const params = [];
            let paramCount = 1;
            conditions.push(`LOWER(TRIM(defect_group)) = LOWER(TRIM($${paramCount}))`);
            params.push(defectGroup);
            console.log('🔧 DefectModel.getByDefectGroup - defect_group param:', defectGroup);
            paramCount++;
            if (options.isActive !== undefined) {
                conditions.push(`is_active = $${paramCount}`);
                params.push(options.isActive);
                paramCount++;
            }
            if (options.search) {
                conditions.push(`(LOWER(name) LIKE $${paramCount} OR LOWER(description) LIKE $${paramCount})`);
                params.push(`%${options.search.toLowerCase()}%`);
                paramCount++;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const countQuery = `SELECT COUNT(*) as total FROM defects ${whereClause}`;
            console.log('🔧 DefectModel.getByDefectGroup - Count query:', countQuery);
            console.log('🔧 DefectModel.getByDefectGroup - Query params:', params);
            const countResult = await client.query(countQuery, params);
            const total = parseInt(countResult.rows[0].total);
            console.log('🔧 DefectModel.getByDefectGroup - Total results found:', total);
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
        }
        finally {
            client.release();
        }
    }
    async isDefectNameUnique(name, excludeId) {
        const client = await this.db.connect();
        try {
            let query = 'SELECT COUNT(*) as count FROM defects WHERE LOWER(name) = LOWER($1)';
            const params = [name.trim()];
            if (excludeId) {
                query += ' AND id != $2';
                params.push(excludeId);
            }
            const result = await client.query(query, params);
            return parseInt(result.rows[0].count) === 0;
        }
        finally {
            client.release();
        }
    }
    transformDefectQueryOptions(options) {
        const genericOptions = {
            page: options.page,
            limit: options.limit,
            sortBy: options.sortBy,
            sortOrder: options.sortOrder,
            search: options.search,
            isActive: options.isActive
        };
        if (options.nameContains) {
            genericOptions.search = options.nameContains;
        }
        if (options.descriptionContains) {
            if (genericOptions.search) {
                genericOptions.search = `${genericOptions.search} ${options.descriptionContains}`;
            }
            else {
                genericOptions.search = options.descriptionContains;
            }
        }
        return genericOptions;
    }
}
exports.DefectModel = DefectModel;
function createDefectModel(db) {
    return new DefectModel(db);
}
exports.default = DefectModel;
