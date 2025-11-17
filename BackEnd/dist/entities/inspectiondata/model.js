"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionDataModel = void 0;
exports.createInspectionDataModel = createInspectionDataModel;
const generic_model_1 = require("../../generic/entities/special-entity/generic-model");
const types_1 = require("./types");
const fiscalWeek_1 = require("../../utils/fiscalWeek");
class InspectionDataModel extends generic_model_1.GenericSpecialModel {
    constructor(db) {
        super(db, types_1.INSPECTIONDATA_ENTITY_CONFIG);
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                throw new Error('ID is required');
            }
            const query = `
        SELECT * FROM inspectiondata
        WHERE id = $1
      `;
            const result = await this.db.query(query, [id]);
            return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
        }
        catch (error) {
            console.error('InspectionData getByKey error:', error);
            throw new Error(`Failed to find inspection data: ${error.message}`);
        }
    }
    async getAll(searchTerm, options) {
        try {
            const page = options?.page && options.page > 0 ? options.page : 1;
            const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
            const offset = (page - 1) * limit;
            let query = `
        SELECT * FROM v_inspectiondata
      `;
            const params = [];
            const whereConditions = [];
            let paramCount = 1;
            if (options?.station && options.station.trim()) {
                whereConditions.push(`station = $${paramCount}`);
                params.push(options.station.trim());
                paramCount++;
            }
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
                const searchConditions = [
                    `inspection_no ILIKE $${paramCount}`,
                    `station ILIKE $${paramCount}`,
                    `shift ILIKE $${paramCount}`,
                    `lotno ILIKE $${paramCount}`,
                    `partsite ILIKE $${paramCount}`,
                    `itemno ILIKE $${paramCount}`,
                    `model ILIKE $${paramCount}`,
                    `version ILIKE $${paramCount}`,
                    `fvilineno ILIKE $${paramCount}`,
                    `mclineno ILIKE $${paramCount}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                params.push(`%${sanitizedSearch}%`);
                paramCount++;
            }
            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }
            query += ` ORDER BY id DESC`;
            query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);
            console.log(`🔧 Executing paginated query: page=${page}, limit=${limit}, offset=${offset}`);
            const result = await this.db.query(query, params);
            return result.rows.map(row => this.mapRowToEntity(row, searchTerm));
        }
        catch (error) {
            console.error('InspectionData getAll error:', error);
            throw new Error(`Failed to get inspection data: ${error.message}`);
        }
    }
    async getCount(searchTerm, station) {
        try {
            let query = `
        SELECT COUNT(*) as total FROM v_inspectiondata
      `;
            const params = [];
            const whereConditions = [];
            let paramCount = 1;
            if (station && station.trim()) {
                whereConditions.push(`station = $${paramCount}`);
                params.push(station.trim());
                paramCount++;
            }
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
                const searchConditions = [
                    `inspection_no ILIKE $${paramCount}`,
                    `station ILIKE $${paramCount}`,
                    `shift ILIKE $${paramCount}`,
                    `lotno ILIKE $${paramCount}`,
                    `partsite ILIKE $${paramCount}`,
                    `itemno ILIKE $${paramCount}`,
                    `model ILIKE $${paramCount}`,
                    `version ILIKE $${paramCount}`,
                    `fvilineno ILIKE $${paramCount}`,
                    `mclineno ILIKE $${paramCount}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                params.push(`%${sanitizedSearch}%`);
            }
            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }
            const result = await this.db.query(query, params);
            return parseInt(result.rows[0].total, 10);
        }
        catch (error) {
            console.error('InspectionData getCount error:', error);
            return 0;
        }
    }
    async getAllCustomer(searchTerm, options) {
        try {
            const page = options?.page && options.page > 0 ? options.page : 1;
            const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
            const offset = (page - 1) * limit;
            let query = `
        SELECT * FROM v_inspectiondata_customer
      `;
            const params = [];
            const whereConditions = [];
            let paramCount = 1;
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
                const searchConditions = [
                    `inspection_no ILIKE $${paramCount}`,
                    `shift ILIKE $${paramCount}`,
                    `lotno ILIKE $${paramCount}`,
                    `partsite ILIKE $${paramCount}`,
                    `itemno ILIKE $${paramCount}`,
                    `model ILIKE $${paramCount}`,
                    `version ILIKE $${paramCount}`,
                    `fvilineno ILIKE $${paramCount}`,
                    `mclineno ILIKE $${paramCount}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                params.push(`%${sanitizedSearch}%`);
                paramCount++;
            }
            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }
            query += ` ORDER BY id DESC`;
            query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);
            console.log(`🔧 Executing paginated query: page=${page}, limit=${limit}, offset=${offset}`);
            const result = await this.db.query(query, params);
            return result.rows.map(row => this.mapRowToEntity(row, searchTerm));
        }
        catch (error) {
            console.error('InspectionData getAll error:', error);
            throw new Error(`Failed to get inspection data: ${error.message}`);
        }
    }
    async getCountCustomer(searchTerm, station) {
        try {
            let query = `
        SELECT COUNT(*) as total FROM v_inspectiondata_customer
      `;
            const params = [];
            const whereConditions = [];
            let paramCount = 1;
            if (searchTerm && searchTerm.trim()) {
                const sanitizedSearch = searchTerm.trim().replace(/[%_\\]/g, '\\$&');
                const searchConditions = [
                    `inspection_no ILIKE $${paramCount}`,
                    `shift ILIKE $${paramCount}`,
                    `lotno ILIKE $${paramCount}`,
                    `partsite ILIKE $${paramCount}`,
                    `itemno ILIKE $${paramCount}`,
                    `model ILIKE $${paramCount}`,
                    `version ILIKE $${paramCount}`,
                    `fvilineno ILIKE $${paramCount}`,
                    `mclineno ILIKE $${paramCount}`
                ];
                whereConditions.push(`(${searchConditions.join(' OR ')})`);
                params.push(`%${sanitizedSearch}%`);
            }
            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }
            const result = await this.db.query(query, params);
            return parseInt(result.rows[0].total, 10);
        }
        catch (error) {
            console.error('InspectionData getCount error:', error);
            return 0;
        }
    }
    async create(data, userId) {
        try {
            const query = `
        INSERT INTO inspectiondata (
          station, inspection_no, inspection_no_ref, inspection_date, fy, ww, month_year,
           shift,lotno, partsite, itemno, model, version, fvilineno, mclineno,
          round, qc_id, fvi_lot_qty, general_sampling_qty, crack_sampling_qty,sampling_reason_id,
          judgment, created_by, updated_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
        RETURNING *
      `;
            const values = [
                data.station,
                data.inspection_no,
                data.inspection_no_ref || '',
                data.inspection_date || new Date(),
                data.fy,
                this.formatWorkWeek(data.ww),
                data.month_year,
                data.shift,
                data.lotno,
                data.partsite,
                data.itemno,
                data.model,
                data.version,
                data.fvilineno,
                data.mclineno,
                data.round || 0,
                data.qc_id || 0,
                data.fvi_lot_qty || 0,
                data.general_sampling_qty || 0,
                data.crack_sampling_qty || 0,
                data.sampling_reason_id || 0,
                data.judgment !== undefined ? data.judgment : null,
                userId || 0,
                userId || 0,
                new Date(),
                new Date()
            ];
            console.log('🔧 Executing inspectiondata create query:', { inspection_no: data.inspection_no });
            const result = await this.db.query(query, values);
            if (result.rows.length > 0) {
                console.log('✅ InspectionData created successfully');
                return {
                    success: true,
                    data: this.mapRowToEntity(result.rows[0])
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to create inspection data'
                };
            }
        }
        catch (error) {
            console.error('❌ Error creating inspection data:', error);
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Inspection number already exists'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
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
            const updateFields = [];
            const values = [];
            let paramCount = 1;
            const fieldMappings = [
                'station', 'inspection_no', 'inspection_date', 'fy', 'ww', 'month_year', 'shift',
                'lotno', 'partsite', 'itemno', 'model', 'version', 'fvilineno', 'mclineno',
                'round', 'qc_id', 'fvi_lot_qty', 'general_sampling_qty', 'crack_sampling_qty',
                'judgment', 'sampling_reason_id'
            ];
            fieldMappings.forEach(field => {
                if (data[field] !== undefined) {
                    updateFields.push(`${field} = $${paramCount}`);
                    const value = field === 'ww'
                        ? this.formatWorkWeek(data[field])
                        : data[field];
                    values.push(value);
                    paramCount++;
                }
            });
            updateFields.push(`updated_by = $${paramCount}`);
            values.push(userId);
            paramCount++;
            updateFields.push(`updated_at = $${paramCount}`);
            values.push(new Date());
            paramCount++;
            if (updateFields.length === 1) {
                return {
                    success: false,
                    error: 'No fields to update'
                };
            }
            values.push(id);
            const query = `
        UPDATE inspectiondata
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
            console.log('🔧 Executing inspectiondata update query:', { id });
            const result = await this.db.query(query, values);
            if (result.rows.length > 0) {
                console.log('✅ InspectionData updated successfully');
                return {
                    success: true,
                    data: this.mapRowToEntity(result.rows[0])
                };
            }
            else {
                return {
                    success: false,
                    error: 'Inspection data not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error updating inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async updateFviToDefault(sivNo) {
        try {
            const query = `
       UPDATE inspectiondata
       SET shift = null,fvilineno = null, qc_id = null
          , general_sampling_qty  = null, crack_sampling_qty = null
          , judgment = null 
        WHERE station='SIV'  and inspection_no = $1
      `;
            console.log('🔧 Executing update FVI record to default query:', { sivNo });
            const result = await this.db.query(query, [sivNo]);
            if (result.rowCount && result.rowCount > 0) {
                console.log('✅ InspectionData update FVI record to defaultsuccessfully');
                return {
                    success: true
                };
            }
            else {
                return {
                    success: false,
                    error: 'Inspection data not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error update FVI record to default inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async delete(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                return {
                    success: false,
                    error: 'ID is required for deletion'
                };
            }
            const query = `
        DELETE FROM inspectiondata
        WHERE id = $1
      `;
            console.log('🔧 Executing inspectiondata delete query:', { id });
            const result = await this.db.query(query, [id]);
            if (result.rowCount && result.rowCount > 0) {
                console.log('✅ InspectionData deleted successfully');
                return {
                    success: true
                };
            }
            else {
                return {
                    success: false,
                    error: 'Inspection data not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error deleting inspection data:', error);
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async exists(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                return false;
            }
            const query = `
        SELECT 1 FROM inspectiondata
        WHERE id = $1
        LIMIT 1
      `;
            const result = await this.db.query(query, [id]);
            return result.rows.length > 0;
        }
        catch (error) {
            console.error('InspectionData exists error:', error);
            return false;
        }
    }
    async getSamplingRoundCount(station, lotno) {
        try {
            const query = `
        SELECT COALESCE(MAX(round), 0) as max_round
        FROM inspectiondata
        WHERE station = $1 AND lotno = $2
      `;
            console.log('🔧 Getting sampling round count:', { station, lotno });
            const result = await this.db.query(query, [station, lotno]);
            const maxRound = result.rows[0]?.max_round || 0;
            console.log(`✅ Current max round for station=${station}, lotno=${lotno}: ${maxRound}`);
            return maxRound;
        }
        catch (error) {
            console.error('❌ Error getting sampling round count:', error);
            return 0;
        }
    }
    async generateInspectionNumber(station, date, wwNumber) {
        try {
            const fiscalYear = (0, fiscalWeek_1.getFiscalYear)(date, 6);
            const fiscalYearYY = fiscalYear.toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const formattedWW = `${String(wwNumber).padStart(2, '0')}`;
            const prefix = `${station}${fiscalYearYY}${month}${formattedWW}-${day}`;
            const query = `
        SELECT inspection_no
        FROM inspectiondata
        WHERE inspection_no LIKE $1
        ORDER BY inspection_no DESC
      `;
            console.log('🔧 Generating inspection number for:', {
                station,
                date: date.toISOString().split('T')[0],
                fiscalYear,
                fiscalYearYY,
                month,
                wwNumber,
                formattedWW,
                prefix
            });
            const result = await this.db.query(query, [`${prefix}%`]);
            let runningNumber = 1;
            if (result.rows.length > 0) {
                let maxRunning = 0;
                for (const row of result.rows) {
                    const inspectionNo = row.inspection_no;
                    const runningStr = inspectionNo.substring(inspectionNo.length - 4);
                    const running = parseInt(runningStr, 10);
                    if (!isNaN(running) && running > maxRunning) {
                        maxRunning = running;
                    }
                }
                runningNumber = maxRunning + 1;
                console.log(`📊 Found ${result.rows.length} existing records, max running: ${maxRunning}, next: ${runningNumber}`);
            }
            const inspectionNo = `${prefix}${runningNumber.toString().padStart(4, '0')}`;
            console.log(`✅ Generated inspection number: ${inspectionNo}`);
            return inspectionNo;
        }
        catch (error) {
            console.error('❌ Error generating inspection number:', error);
            const fiscalYear = (0, fiscalWeek_1.getFiscalYear)(date, 6);
            const fiscalYearYY = fiscalYear.toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const formattedWW = `W${String(wwNumber).padStart(2, '0')}`;
            const timestamp = Date.now().toString().slice(-4);
            return `${station}${fiscalYearYY}${month}${formattedWW}-${day}${timestamp}`;
        }
    }
    formatWorkWeek(ww) {
        const wwString = String(ww);
        return wwString.padStart(2, '0');
    }
    mapRowToEntity(row, searchTerm) {
        const entity = {
            id: row.id,
            station: row.station,
            inspection_no: row.inspection_no,
            inspection_date: row.inspection_date,
            fy: row.fy,
            ww: row.ww,
            month_year: row.month_year,
            shift: row.shift,
            lotno: row.lotno,
            partsite: row.partsite,
            itemno: row.itemno,
            model: row.model,
            version: row.version,
            fvilineno: row.fvilineno,
            mclineno: row.mclineno,
            round: row.round,
            qc_id: row.qc_id,
            fvi_lot_qty: row.fvi_lot_qty,
            sampling_reason_id: row.sampling_reason_id,
            general_sampling_qty: row.general_sampling_qty || 0,
            crack_sampling_qty: row.crack_sampling_qty || 0,
            judgment: row.judgment,
            inspection_no_ref: row.inspection_no_ref,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            sampling_reason_name: row.sampling_reason_name,
            sampling_reason_description: row.sampling_reason_description,
            defect_num: row.defect_num || 0,
            ng_num: row.ng_num || 0
        };
        if (searchTerm && searchTerm.trim()) {
            entity.highlight = this.createHighlightedFields(entity, searchTerm);
        }
        return entity;
    }
    createHighlightedFields(entity, searchTerm) {
        const highlighted = {};
        const searchableFields = ['inspection_no', 'station', 'shift', 'lotno', 'partsite', 'itemno', 'model', 'version', 'fvilineno'];
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        searchableFields.forEach(field => {
            const value = entity[field];
            if (value && typeof value === 'string') {
                const highlightedValue = value.replace(regex, '<mark>$1</mark>');
                if (highlightedValue !== value) {
                    highlighted[field] = highlightedValue;
                }
            }
        });
        console.log(`🔍 Highlighting for "${searchTerm}":`, Object.keys(highlighted));
        return highlighted;
    }
    async getDefectsForInspection(inspection_no) {
        try {
            const query = `
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = $1
        ORDER BY dd.id DESC
      `;
            const result = await this.db.query(query, [inspection_no]);
            const defectsWithImages = await Promise.all(result.rows.map(async (defect) => {
                try {
                    const imageQuery = `
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_image
              WHERE defect_id = $1
              ORDER BY id
            `;
                    const imageResult = await this.db.query(imageQuery, [defect.id]);
                    const imageUrls = imageResult.rows.map((img) => `data:image/jpeg;base64,${img.image_data}`);
                    return {
                        ...defect,
                        image_urls: imageUrls
                    };
                }
                catch (error) {
                    console.error(`Error loading images for defect ${defect.id}:`, error);
                    return {
                        ...defect,
                        image_urls: []
                    };
                }
            }));
            return defectsWithImages;
        }
        catch (error) {
            console.error('Error fetching defects for inspection:', error);
            return [];
        }
    }
    async getDefectsCustomerForInspection(inspection_no) {
        try {
            const query = `
        SELECT
          dd.*,
          d.name as defect_name
        FROM defectdata_customer dd
        LEFT JOIN defects d ON dd.defect_id = d.id
        WHERE dd.inspection_no = $1
        ORDER BY dd.id DESC
      `;
            const result = await this.db.query(query, [inspection_no]);
            const defectsWithImages = await Promise.all(result.rows.map(async (defect) => {
                try {
                    const imageQuery = `
              SELECT id, encode(imge_data, 'base64') as image_data
              FROM defect_customer_image
              WHERE defect_id = $1
              ORDER BY id
            `;
                    const imageResult = await this.db.query(imageQuery, [defect.id]);
                    const imageUrls = imageResult.rows.map((img) => `data:image/jpeg;base64,${img.image_data}`);
                    return {
                        ...defect,
                        image_urls: imageUrls
                    };
                }
                catch (error) {
                    console.error(`Error loading images for defect ${defect.id}:`, error);
                    return {
                        ...defect,
                        image_urls: []
                    };
                }
            }));
            return defectsWithImages;
        }
        catch (error) {
            console.error('Error fetching defects for inspection:', error);
            return [];
        }
    }
    async getAllWithDefects(searchTerm, options) {
        try {
            const inspections = await this.getAll(searchTerm, options);
            const inspectionsWithDefects = await Promise.all(inspections.map(async (inspection) => {
                const defects = await this.getDefectsForInspection(inspection.inspection_no);
                return {
                    ...inspection,
                    defects: defects
                };
            }));
            return inspectionsWithDefects;
        }
        catch (error) {
            console.error('InspectionData getAllWithDefects error:', error);
            throw new Error(`Failed to get inspection data with defects: ${error.message}`);
        }
    }
    async getAllWithDefectsCustomer(searchTerm, options) {
        try {
            const inspections = await this.getAllCustomer(searchTerm, options);
            const inspectionsWithDefects = await Promise.all(inspections.map(async (inspection) => {
                const defects = await this.getDefectsCustomerForInspection(inspection.inspection_no);
                return {
                    ...inspection,
                    defects: defects
                };
            }));
            return inspectionsWithDefects;
        }
        catch (error) {
            console.error('InspectionData getAllWithDefects error:', error);
            throw new Error(`Failed to get inspection data with defects: ${error.message}`);
        }
    }
    async getStationStatistics(station) {
        try {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentWeek = this.getCurrentWeekNumber(today);
            const yearStart = `${currentYear}-01-01`;
            const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
            const todayStr = today.toISOString().split('T')[0];
            const query = `
        SELECT
          COUNT(*)::int as total,
          COUNT(CASE WHEN EXTRACT(YEAR FROM inspection_date) = $2 THEN 1 END)::int as this_year,
          COUNT(CASE WHEN inspection_date >= $3::date THEN 1 END)::int as this_month,
          COUNT(CASE WHEN ww = $4 THEN 1 END)::int as this_week,
          COUNT(CASE WHEN DATE(inspection_date) = $5::date THEN 1 END)::int as today
        FROM ${this.config.tableName}
        WHERE station = $1
      `;
            const result = await this.db.query(query, [station, currentYear, monthStart, String(currentWeek).padStart(2, '0'), todayStr]);
            return result.rows[0] || {
                total: 0,
                this_year: 0,
                this_month: 0,
                this_week: 0,
                today: 0
            };
        }
        catch (error) {
            console.error(`Error getting station statistics for ${station}:`, error);
            throw error;
        }
    }
    async getWeeklyTrend(station) {
        try {
            const query = `
        SELECT
          ww,
          COUNT(*)::int as total,
          COUNT(CASE WHEN judgment = true THEN 1 END)::int as pass,
          COUNT(CASE WHEN judgment = false THEN 1 END)::int as fail
        FROM ${this.config.tableName}
        WHERE station = $1
          AND ww IS NOT NULL AND ww != ''
        GROUP BY ww
        ORDER BY ww DESC
        LIMIT 12
      `;
            const result = await this.db.query(query, [station]);
            return result.rows.reverse();
        }
        catch (error) {
            console.error(`Error getting weekly trend for ${station}:`, error);
            throw error;
        }
    }
    getCurrentWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    buildKeyWhereClause(keyValues) {
        const { id } = keyValues;
        return {
            clause: 'id = $1',
            params: [id]
        };
    }
}
exports.InspectionDataModel = InspectionDataModel;
function createInspectionDataModel(db) {
    return new InspectionDataModel(db);
}
exports.default = InspectionDataModel;
