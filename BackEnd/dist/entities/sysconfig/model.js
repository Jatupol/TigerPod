"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SysconfigModel = void 0;
exports.createSysconfigModel = createSysconfigModel;
const generic_model_1 = require("../../generic/entities/serial-id-entity/generic-model");
const types_1 = require("./types");
class SysconfigModel extends generic_model_1.GenericSerialIdModel {
    constructor(db) {
        super(db, types_1.SYSCONFIG_ENTITY_CONFIG);
    }
    async findById(id) {
        try {
            const query = `
        SELECT * FROM ${this.config.tableName}
        WHERE id = $1
      `;
            const result = await this.db.query(query, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to find sysconfig by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findAll(options = {}) {
        try {
            const { page = 1, limit = this.config.defaultLimit, sortBy = 'id', sortOrder = 'ASC', search, isActive } = options;
            const offset = (page - 1) * limit;
            const conditions = [];
            const params = [];
            let paramIndex = 1;
            if (search && search.trim()) {
                const searchConditions = this.config.searchableFields.map(field => `${field} ILIKE $${paramIndex}`).join(' OR ');
                if (searchConditions) {
                    conditions.push(`(${searchConditions})`);
                    params.push(`%${search.trim()}%`);
                    paramIndex++;
                }
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const validSortFields = ['id', 'system_name', 'created_at', 'updated_at'];
            const validSortField = validSortFields.includes(sortBy) ? sortBy : 'id';
            const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            const query = `
        SELECT * FROM ${this.config.tableName}
        ${whereClause}
        ORDER BY ${validSortField} ${validSortOrder}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
            params.push(limit, offset);
            const countQuery = `
        SELECT COUNT(*) as total FROM ${this.config.tableName}
        ${whereClause}
      `;
            const [dataResult, countResult] = await Promise.all([
                this.db.query(query, params),
                this.db.query(countQuery, params.slice(0, -2))
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
            throw new Error(`Failed to find sysconfigs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async create(data, userId) {
        if (!(0, types_1.isCreateSysconfigRequest)(data)) {
            throw new Error('Invalid sysconfig creation data provided');
        }
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const query = `
        INSERT INTO sysconfig (
          fvi_lot_qty, general_oqa_qty, crack_oqa_qty, general_siv_qty, crack_siv_qty,
          defect_type, defect_group, defect_color, shift, site, tabs, product_type, product_families,
          smtp_server, smtp_port, smtp_username, smtp_password,
          system_name, system_updated, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        )
        RETURNING *
      `;
            const values = [
                data.fvi_lot_qty,
                data.general_oqa_qty,
                data.crack_oqa_qty,
                data.general_siv_qty,
                data.crack_siv_qty,
                data.defect_type,
                data.defect_group || '',
                data.defect_color || '',
                data.shift,
                data.site,
                data.tabs,
                data.product_type,
                data.product_families,
                data.smtp_server || null,
                data.smtp_port ?? types_1.SYSCONFIG_CONSTANTS.DEFAULT_VALUES.SMTP_PORT,
                data.smtp_username || null,
                data.smtp_password || null,
                data.system_name || null,
                data.system_updated || null,
                userId,
                userId
            ];
            const result = await client.query(query, values);
            await client.query('COMMIT');
            const createdSysconfig = result.rows[0];
            if (!(0, types_1.isSysconfig)(createdSysconfig)) {
                throw new Error('Created sysconfig entity does not match expected structure');
            }
            return createdSysconfig;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to create sysconfig: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            client.release();
        }
    }
    async update(id, data, userId) {
        console.log('📥 Model.update called with:');
        console.log('  - ID:', id);
        console.log('  - userId:', userId);
        console.log('  - Data keys:', Object.keys(data));
        console.log('  - Data:', JSON.stringify(data, null, 2));
        if (!(0, types_1.isUpdateSysconfigRequest)(data)) {
            console.error('❌ Invalid sysconfig update data');
            throw new Error('Invalid sysconfig update data provided');
        }
        if (Object.keys(data).length === 0) {
            console.error('❌ No update data provided');
            throw new Error('No update data provided');
        }
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const updateFields = [];
            const values = [];
            let paramIndex = 1;
            const fieldMap = {
                'fvi_lot_qty': 'fvi_lot_qty',
                'general_oqa_qty': 'general_oqa_qty',
                'crack_oqa_qty': 'crack_oqa_qty',
                'general_siv_qty': 'general_siv_qty',
                'crack_siv_qty': 'crack_siv_qty',
                'defect_type': 'defect_type',
                'defect_group': 'defect_group',
                'defect_color': 'defect_color',
                'shift': 'shift',
                'site': 'site',
                'tabs': 'tabs',
                'product_type': 'product_type',
                'product_families': 'product_families',
                'smtp_server': 'smtp_server',
                'smtp_port': 'smtp_port',
                'smtp_username': 'smtp_username',
                'smtp_password': 'smtp_password',
                'defect_notification_emails': 'defect_notification_emails',
                'mssql_server': 'mssql_server',
                'mssql_port': 'mssql_port',
                'mssql_database': 'mssql_database',
                'mssql_username': 'mssql_username',
                'mssql_password': 'mssql_password',
                'mssql_sync': 'mssql_sync',
                'system_name': 'system_name',
                'system_version': 'system_version',
                'system_updated': 'system_updated',
                'news': 'news'
            };
            Object.entries(fieldMap).forEach(([dbField, dataField]) => {
                if (data[dataField] !== undefined) {
                    updateFields.push(`${dbField} = $${paramIndex}`);
                    values.push(data[dataField]);
                    paramIndex++;
                }
            });
            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            updateFields.push(`updated_by = $${paramIndex}`);
            values.push(userId);
            paramIndex++;
            values.push(id);
            const query = `
        UPDATE sysconfig
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
            console.log('🔍 SQL Query:', query);
            console.log('📊 Query Parameters:', values);
            console.log('🎯 Update Fields:', updateFields);
            const result = await client.query(query, values);
            console.log('✅ Query executed successfully, rows affected:', result.rowCount);
            if (result.rows.length === 0) {
                throw new Error('Sysconfig not found or already deleted');
            }
            await client.query('COMMIT');
            const updatedSysconfig = result.rows[0];
            console.log('updatedSysconfig : ', updatedSysconfig);
            return updatedSysconfig;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to update sysconfig: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        finally {
            client.release();
        }
    }
    async findAllSysconfigs(options = {}) {
        const { system_name, has_smtp_server, ...baseOptions } = options;
        const additionalConditions = [];
        const additionalParams = [];
        let paramOffset = 0;
        if (system_name) {
            additionalConditions.push(`system_name ILIKE $${paramOffset + 1}`);
            additionalParams.push(`%${system_name}%`);
            paramOffset++;
        }
        if (has_smtp_server !== undefined) {
            if (has_smtp_server) {
                additionalConditions.push(`smtp_server IS NOT NULL AND smtp_server != ''`);
            }
            else {
                additionalConditions.push(`(smtp_server IS NULL OR smtp_server = '')`);
            }
        }
        if (additionalConditions.length > 0) {
            return this.findAllWithCustomConditions(baseOptions, additionalConditions, additionalParams);
        }
        return this.findAll(baseOptions);
    }
    async findByIdWithParsed(id) {
        const sysconfig = await this.findById(id);
        if (!sysconfig) {
            return null;
        }
        return (0, types_1.createSysconfigWithParsed)(sysconfig);
    }
    async findAllWithParsed(options = {}) {
        const result = await this.findAllSysconfigs(options);
        return {
            ...result,
            data: result.data.map(sysconfig => (0, types_1.createSysconfigWithParsed)(sysconfig))
        };
    }
    async getActiveConfig() {
        const query = `
      SELECT * FROM ${this.config.tableName}
      ORDER BY created_at DESC
      LIMIT 1
    `;
        try {
            const result = await this.db.query(query);
            return result.rows[0] || null;
        }
        catch (error) {
            throw new Error(`Failed to get active sysconfig: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getActiveConfigWithParsed() {
        const sysconfig = await this.getActiveConfig();
        if (!sysconfig) {
            return null;
        }
        return (0, types_1.createSysconfigWithParsed)(sysconfig);
    }
    async validateConfigurationValues(data) {
        const errors = [];
        const warnings = [];
        try {
            if (data.fvi_lot_qty) {
                const values = data.fvi_lot_qty.split(',').map(v => parseInt(v.trim()));
                const invalidValues = values.filter(v => isNaN(v) || v < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_QTY_VALUE || v > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
                if (invalidValues.length > 0) {
                    errors.push(`Invalid FVI lot quantity values: ${invalidValues.join(', ')}`);
                }
                if (values.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_FVI_LOT_QTY_VALUES) {
                    warnings.push(`FVI lot quantity has more than ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_FVI_LOT_QTY_VALUES} values`);
                }
            }
            if (data.general_oqa_qty) {
                const values = data.general_oqa_qty.split(',').map(v => parseInt(v.trim()));
                const invalidValues = values.filter(v => isNaN(v) || v < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_QTY_VALUE || v > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
                if (invalidValues.length > 0) {
                    errors.push(`Invalid general sampling quantity values: ${invalidValues.join(', ')}`);
                }
                if (values.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_GENERAL_OQA_QTY_VALUES) {
                    warnings.push(`General sampling quantity has more than ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_GENERAL_OQA_QTY_VALUES} values`);
                }
            }
            if (data.crack_oqa_qty) {
                const values = data.crack_oqa_qty.split(',').map(v => parseInt(v.trim()));
                const invalidValues = values.filter(v => isNaN(v) || v < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_QTY_VALUE || v > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
                if (invalidValues.length > 0) {
                    errors.push(`Invalid crack sampling quantity values: ${invalidValues.join(', ')}`);
                }
                if (values.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CRACK_OQA_VALUES) {
                    warnings.push(`Crack sampling quantity has more than ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CRACK_OQA_VALUES} values`);
                }
            }
            if (data.general_siv_qty) {
                const values = data.general_siv_qty.split(',').map(v => parseInt(v.trim()));
                const invalidValues = values.filter(v => isNaN(v) || v < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_QTY_VALUE || v > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
                if (invalidValues.length > 0) {
                    errors.push(`Invalid general sampling quantity values: ${invalidValues.join(', ')}`);
                }
                if (values.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_GENERAL_SIV_QTY_VALUES) {
                    warnings.push(`General sampling quantity has more than ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_GENERAL_SIV_QTY_VALUES} values`);
                }
            }
            if (data.crack_siv_qty) {
                const values = data.crack_siv_qty.split(',').map(v => parseInt(v.trim()));
                const invalidValues = values.filter(v => isNaN(v) || v < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_QTY_VALUE || v > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_QTY_VALUE);
                if (invalidValues.length > 0) {
                    errors.push(`Invalid crack sampling quantity values: ${invalidValues.join(', ')}`);
                }
                if (values.length > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CRACK_OQA_QTY_VALUES) {
                    warnings.push(`Crack sampling quantity has more than ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_CRACK_OQA_QTY_VALUES} values`);
                }
            }
            if (data.smtp_port !== undefined) {
                if (data.smtp_port < types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT ||
                    data.smtp_port > types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT) {
                    errors.push(`SMTP port must be between ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MIN_SMTP_PORT} and ${types_1.SYSCONFIG_CONSTANTS.VALIDATION_LIMITS.MAX_SMTP_PORT}`);
                }
            }
            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                isValid: false,
                errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings
            };
        }
    }
    async findAllWithCustomConditions(baseOptions, additionalConditions, additionalParams) {
        const { page = 1, limit = this.config.defaultLimit, sortBy = 'id', sortOrder = 'ASC', search, isActive = true } = baseOptions;
        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (search && search.trim()) {
            const searchConditions = this.config.searchableFields.map(field => `${field} ILIKE $${paramIndex}`).join(' OR ');
            if (searchConditions) {
                conditions.push(`(${searchConditions})`);
                params.push(`%${search.trim()}%`);
                paramIndex++;
            }
        }
        additionalConditions.forEach((condition, index) => {
            const adjustedCondition = condition.replace(/\$(\d+)/g, (match, num) => {
                return `$${paramIndex + parseInt(num) - 1}`;
            });
            conditions.push(adjustedCondition);
        });
        params.push(...additionalParams);
        paramIndex += additionalParams.length;
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const validSortFields = ['id', 'system_name', 'created_at', 'updated_at'];
        const validSortField = validSortFields.includes(sortBy) ? sortBy : 'id';
        const validSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const query = `
      SELECT * FROM ${this.config.tableName}
      ${whereClause}
      ORDER BY ${validSortField} ${validSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
        params.push(limit, offset);
        const countQuery = `
      SELECT COUNT(*) as total FROM ${this.config.tableName}
      ${whereClause}
    `;
        try {
            const [dataResult, countResult] = await Promise.all([
                this.db.query(query, params),
                this.db.query(countQuery, params.slice(0, -2))
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
            throw new Error(`Failed to find sysconfigs with custom conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.SysconfigModel = SysconfigModel;
function createSysconfigModel(db) {
    return new SysconfigModel(db);
}
exports.default = SysconfigModel;
