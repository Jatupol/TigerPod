"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQADataModel = void 0;
exports.createIQADataModel = createIQADataModel;
const generic_model_1 = require("../../generic/entities/special-entity/generic-model");
const types_1 = require("./types");
const fiscalWeek_1 = require("../../utils/fiscalWeek");
class IQADataModel extends generic_model_1.GenericSpecialModel {
    constructor(db) {
        super(db, types_1.DEFAULT_IQADATA_CONFIG);
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                throw new Error('ID is required');
            }
            const query = `SELECT * FROM iqadata WHERE id = $1`;
            const result = await this.db.query(query, [id]);
            return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
        }
        catch (error) {
            console.error('IQAData getByKey error:', error);
            throw new Error(`Failed to find IQA data: ${error.message}`);
        }
    }
    async getAll(searchTerm) {
        try {
            let query = `SELECT * FROM iqadata`;
            const params = [];
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
                const searchConditions = [
                    'ww ILIKE $1',
                    'model ILIKE $1',
                    'supplier ILIKE $1',
                    'qc_owner ILIKE $1',
                    'item ILIKE $1',
                    'lotno ILIKE $1',
                    'defect ILIKE $1'
                ];
                query += ` WHERE (${searchConditions.join(' OR ')})`;
                params.push(`%${sanitizedSearch}%`);
            }
            query += ` ORDER BY id DESC`;
            const result = await this.db.query(query, params);
            return result.rows.map(row => this.mapRowToEntity(row, searchTerm));
        }
        catch (error) {
            console.error('IQAData getAll error:', error);
            throw new Error(`Failed to get IQA data: ${error.message}`);
        }
    }
    async create(data, userId) {
        try {
            let calculatedFY;
            let calculatedWW;
            if (data.date_iqa) {
                const fyNumber = (0, fiscalWeek_1.getFiscalYear)(data.date_iqa);
                const wwNumber = (0, fiscalWeek_1.calculateFiscalWeekNumber)(data.date_iqa);
                calculatedFY = fyNumber.toString();
                calculatedWW = wwNumber.toString().padStart(2, '0');
            }
            const fields = [];
            const placeholders = [];
            const values = [];
            let paramCount = 1;
            const fieldMap = {
                fy: calculatedFY || data.fy,
                ww: calculatedWW || data.ww,
                fw: data.fw,
                date_iqa: data.date_iqa,
                shift_to_shift: data.shift_to_shift,
                expense: data.expense,
                re_expense: data.re_expense,
                qc_owner: data.qc_owner,
                model: data.model,
                item: data.item,
                telex: data.telex,
                supplier: data.supplier,
                descr: data.descr,
                location: data.location,
                qty: data.qty,
                supplier_do: data.supplier_do,
                remark: data.remark,
                po: data.po,
                sbr: data.sbr,
                disposition_code: data.disposition_code,
                receipt_date: data.receipt_date,
                age: data.age,
                warehouse: data.warehouse,
                building: data.building,
                business_unit: data.business_unit,
                std_case_qty: data.std_case_qty,
                lpn: data.lpn,
                lotno: data.lotno,
                ref_code: data.ref_code,
                data_on_web: data.data_on_web,
                inspec: data.inspec,
                rej: data.rej,
                defect: data.defect,
                vender: data.vender
            };
            Object.entries(fieldMap).forEach(([field, value]) => {
                if (value !== undefined) {
                    fields.push(field);
                    placeholders.push(`$${paramCount++}`);
                    values.push(value);
                }
            });
            if (fields.length === 0) {
                return {
                    success: false,
                    error: 'No data provided for insert'
                };
            }
            const query = `
        INSERT INTO iqadata (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
            const result = await this.db.query(query, values);
            return {
                success: true,
                data: this.mapRowToEntity(result.rows[0])
            };
        }
        catch (error) {
            console.error('IQAData create error:', error);
            return {
                success: false,
                error: `Failed to create IQA data: ${error.message}`
            };
        }
    }
    async update(keyValues, data, userId) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for update'
                };
            }
            const setFields = [];
            const values = [];
            let paramCount = 1;
            const fieldMap = {
                ww: data.ww,
                date_iqa: data.date_iqa,
                shift_to_shift: data.shift_to_shift,
                expense: data.expense,
                re_expense: data.re_expense,
                qc_owner: data.qc_owner,
                model: data.model,
                item: data.item,
                telex: data.telex,
                supplier: data.supplier,
                descr: data.descr,
                location: data.location,
                qty: data.qty,
                supplier_do: data.supplier_do,
                remark: data.remark,
                po: data.po,
                sbr: data.sbr,
                disposition_code: data.disposition_code,
                receipt_date: data.receipt_date,
                age: data.age,
                warehouse: data.warehouse,
                building: data.building,
                business_unit: data.business_unit,
                std_case_qty: data.std_case_qty,
                lpn: data.lpn,
                lotno: data.lotno,
                ref_code: data.ref_code,
                data_on_web: data.data_on_web,
                inspec: data.inspec,
                rej: data.rej,
                defect: data.defect,
                vender: data.vender
            };
            Object.entries(fieldMap).forEach(([field, value]) => {
                if (value !== undefined) {
                    setFields.push(`${field} = $${paramCount++}`);
                    values.push(value);
                }
            });
            if (setFields.length === 0) {
                return {
                    success: false,
                    error: 'No data provided for update'
                };
            }
            values.push(id);
            const query = `
        UPDATE iqadata
        SET ${setFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'IQA data not found'
                };
            }
            return {
                success: true,
                data: this.mapRowToEntity(result.rows[0])
            };
        }
        catch (error) {
            console.error('IQAData update error:', error);
            return {
                success: false,
                error: `Failed to update IQA data: ${error.message}`
            };
        }
    }
    async delete(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for delete'
                };
            }
            const query = `DELETE FROM iqadata WHERE id = $1`;
            const result = await this.db.query(query, [id]);
            if (result.rowCount === 0) {
                return {
                    success: false,
                    error: 'IQA data not found'
                };
            }
            return { success: true };
        }
        catch (error) {
            console.error('IQAData delete error:', error);
            return {
                success: false,
                error: `Failed to delete IQA data: ${error.message}`
            };
        }
    }
    async bulkCreate(records) {
        if (records.length === 0) {
            return [];
        }
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const insertedRecords = [];
            for (const record of records) {
                let calculatedFY;
                let calculatedWW;
                if (record.date_iqa) {
                    const fyNumber = (0, fiscalWeek_1.getFiscalYear)(record.date_iqa);
                    const wwNumber = (0, fiscalWeek_1.calculateFiscalWeekNumber)(record.date_iqa);
                    calculatedFY = fyNumber.toString();
                    calculatedWW = wwNumber.toString().padStart(2, '0');
                }
                const fields = [];
                const placeholders = [];
                const values = [];
                const updateSet = [];
                let paramCount = 1;
                const fieldMap = {
                    fy: calculatedFY || record.fy,
                    ww: calculatedWW || record.ww,
                    fw: record.fw,
                    date_iqa: record.date_iqa,
                    shift_to_shift: record.shift_to_shift,
                    expense: record.expense,
                    re_expense: record.re_expense,
                    qc_owner: record.qc_owner,
                    model: record.model,
                    item: record.item,
                    telex: record.telex,
                    supplier: record.supplier,
                    descr: record.descr,
                    location: record.location,
                    qty: record.qty,
                    supplier_do: record.supplier_do,
                    remark: record.remark,
                    po: record.po,
                    sbr: record.sbr,
                    disposition_code: record.disposition_code,
                    receipt_date: record.receipt_date,
                    age: record.age,
                    warehouse: record.warehouse,
                    building: record.building,
                    business_unit: record.business_unit,
                    std_case_qty: record.std_case_qty,
                    lpn: record.lpn,
                    lotno: record.lotno,
                    ref_code: record.ref_code,
                    data_on_web: record.data_on_web,
                    inspec: record.inspec,
                    rej: record.rej,
                    defect: record.defect,
                    vender: record.vender
                };
                Object.entries(fieldMap).forEach(([field, value]) => {
                    if (value !== undefined) {
                        fields.push(field);
                        placeholders.push(`$${paramCount++}`);
                        values.push(value);
                        updateSet.push(`${field} = EXCLUDED.${field}`);
                    }
                });
                if (fields.length === 0) {
                    continue;
                }
                const query = `
          INSERT INTO iqadata (${fields.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT (fy, ww, fw, date_iqa, model, lotno, location, supplier_do, age, ref_code)
          DO UPDATE SET ${updateSet.join(', ')}
          RETURNING *
        `;
                try {
                    const result = await client.query(query, values);
                    if (result.rows.length > 0) {
                        insertedRecords.push(this.mapRowToEntity(result.rows[0]));
                    }
                }
                catch (error) {
                    if (error.code === '42P10' || error.message.includes('does not exist')) {
                        console.warn('⚠️ Unique constraint on (fy, ww, lotno) does not exist. Using INSERT instead.');
                        const insertQuery = `
              INSERT INTO iqadata (${fields.join(', ')})
              VALUES (${placeholders.join(', ')})
              RETURNING *
            `;
                        const insertResult = await client.query(insertQuery, values);
                        if (insertResult.rows.length > 0) {
                            insertedRecords.push(this.mapRowToEntity(insertResult.rows[0]));
                        }
                    }
                    else {
                        throw error;
                    }
                }
            }
            await client.query('COMMIT');
            return insertedRecords;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async upsert(records) {
        if (records.length === 0) {
            return { inserted: 0, updated: 0, failed: 0 };
        }
        const client = await this.db.connect();
        let inserted = 0;
        let updated = 0;
        let failed = 0;
        try {
            await client.query('BEGIN');
            for (const record of records) {
                try {
                    let calculatedFY;
                    let calculatedWW;
                    if (record.date_iqa) {
                        const fyNumber = (0, fiscalWeek_1.getFiscalYear)(record.date_iqa);
                        const wwNumber = (0, fiscalWeek_1.calculateFiscalWeekNumber)(record.date_iqa);
                        calculatedFY = fyNumber.toString();
                        calculatedWW = wwNumber.toString().padStart(2, '0');
                    }
                    const fields = [];
                    const placeholders = [];
                    const values = [];
                    const updateSet = [];
                    let paramCount = 1;
                    const fieldMap = {
                        fy: calculatedFY || record.fy,
                        ww: calculatedWW || record.ww,
                        fw: record.fw,
                        date_iqa: record.date_iqa,
                        shift_to_shift: record.shift_to_shift,
                        expense: record.expense,
                        re_expense: record.re_expense,
                        qc_owner: record.qc_owner,
                        model: record.model,
                        item: record.item,
                        telex: record.telex,
                        supplier: record.supplier,
                        descr: record.descr,
                        location: record.location,
                        qty: record.qty,
                        supplier_do: record.supplier_do,
                        remark: record.remark,
                        po: record.po,
                        sbr: record.sbr,
                        disposition_code: record.disposition_code,
                        receipt_date: record.receipt_date,
                        age: record.age,
                        warehouse: record.warehouse,
                        building: record.building,
                        business_unit: record.business_unit,
                        std_case_qty: record.std_case_qty,
                        lpn: record.lpn,
                        lotno: record.lotno,
                        ref_code: record.ref_code,
                        data_on_web: record.data_on_web,
                        inspec: record.inspec,
                        rej: record.rej,
                        defect: record.defect,
                        vender: record.vender
                    };
                    Object.entries(fieldMap).forEach(([field, value]) => {
                        if (value !== undefined) {
                            fields.push(field);
                            placeholders.push(`$${paramCount++}`);
                            values.push(value);
                            updateSet.push(`${field} = EXCLUDED.${field}`);
                        }
                    });
                    if (fields.length === 0) {
                        failed++;
                        continue;
                    }
                    const checkQuery = `
            SELECT id FROM iqadata
            WHERE fy = $1 AND ww = $2 AND fw = $3 AND date_iqa = $4
              AND model = $5 AND lotno = $6 AND location = $7
              AND supplier_do = $8 AND age = $9 AND ref_code = $10
          `;
                    const checkResult = await client.query(checkQuery, [
                        calculatedFY || record.fy,
                        calculatedWW || record.ww,
                        record.fw,
                        record.date_iqa,
                        record.model,
                        record.lotno,
                        record.location,
                        record.supplier_do,
                        record.age,
                        record.ref_code
                    ]);
                    const recordExists = checkResult.rows.length > 0;
                    const query = `
            INSERT INTO iqadata (${fields.join(', ')})
            VALUES (${placeholders.join(', ')})
            ON CONFLICT (fy, ww, fw, date_iqa, model, lotno, location, supplier_do, age, ref_code)
            DO UPDATE SET ${updateSet.join(', ')}
            RETURNING *
          `;
                    const result = await client.query(query, values);
                    if (result.rows.length > 0) {
                        if (recordExists) {
                            updated++;
                        }
                        else {
                            inserted++;
                        }
                    }
                }
                catch (error) {
                    console.error('Error upserting record:', error.message);
                    failed++;
                }
            }
            await client.query('COMMIT');
            return { inserted, updated, failed };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteAll() {
        try {
            const result = await this.db.query('DELETE FROM iqadata');
            return result.rowCount || 0;
        }
        catch (error) {
            console.error('IQAData deleteAll error:', error);
            throw new Error(`Failed to delete all IQA data: ${error.message}`);
        }
    }
    async getDistinctFY() {
        try {
            const query = `
        SELECT DISTINCT fy
        FROM iqadata
        WHERE fy IS NOT NULL AND fy != ''
        ORDER BY fy DESC
      `;
            const result = await this.db.query(query);
            return result.rows.map(row => row.fy);
        }
        catch (error) {
            console.error('IQAData getDistinctFY error:', error);
            throw new Error(`Failed to get distinct FY values: ${error.message}`);
        }
    }
    async getDistinctWW(fy) {
        try {
            let query;
            let values = [];
            if (fy && fy.trim() !== '') {
                query = `
          SELECT DISTINCT ww
          FROM iqadata
          WHERE ww IS NOT NULL AND ww != '' AND fy = $1
          ORDER BY ww ASC
        `;
                values = [fy];
            }
            else {
                query = `
          SELECT DISTINCT ww
          FROM iqadata
          WHERE ww IS NOT NULL AND ww != ''
          ORDER BY ww ASC
        `;
            }
            const result = await this.db.query(query, values);
            return result.rows.map(row => row.ww);
        }
        catch (error) {
            console.error('IQAData getDistinctWW error:', error);
            throw new Error(`Failed to get distinct WW values: ${error.message}`);
        }
    }
    mapRowToEntity(row, searchTerm) {
        const entity = {
            id: row.id,
            fy: row.fy,
            ww: row.ww,
            fw: row.fw,
            date_iqa: row.date_iqa,
            shift_to_shift: row.shift_to_shift,
            expense: row.expense,
            re_expense: row.re_expense,
            qc_owner: row.qc_owner,
            model: row.model,
            item: row.item,
            telex: row.telex,
            supplier: row.supplier,
            descr: row.descr,
            location: row.location,
            qty: row.qty,
            supplier_do: row.supplier_do,
            remark: row.remark,
            po: row.po,
            sbr: row.sbr,
            disposition_code: row.disposition_code,
            receipt_date: row.receipt_date,
            age: row.age,
            warehouse: row.warehouse,
            building: row.building,
            business_unit: row.business_unit,
            std_case_qty: row.std_case_qty,
            lpn: row.lpn,
            lotno: row.lotno,
            ref_code: row.ref_code,
            data_on_web: row.data_on_web,
            inspec: row.inspec,
            rej: row.rej,
            defect: row.defect,
            vender: row.vender,
            import_at: row.import_at,
            is_active: row.is_active !== undefined ? row.is_active : true,
            created_by: row.created_by || 0,
            updated_by: row.updated_by || 0,
            created_at: row.created_at ? new Date(row.created_at) : (row.import_at ? new Date(row.import_at) : new Date()),
            updated_at: row.updated_at ? new Date(row.updated_at) : (row.import_at ? new Date(row.import_at) : new Date())
        };
        if (searchTerm) {
            entity.highlight = this.highlightSearchTerm(entity, searchTerm);
        }
        return entity;
    }
    highlightSearchTerm(entity, searchTerm) {
        const highlight = {};
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const searchableFields = ['ww', 'model', 'supplier', 'qc_owner', 'item', 'lotno', 'defect'];
        searchableFields.forEach(field => {
            const value = entity[field];
            if (value && typeof value === 'string' && regex.test(value)) {
                highlight[field] = value.replace(regex, '<mark>$1</mark>');
            }
        });
        return highlight;
    }
}
exports.IQADataModel = IQADataModel;
function createIQADataModel(db) {
    return new IQADataModel(db);
}
exports.default = IQADataModel;
