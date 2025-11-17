"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfLotInputService = void 0;
const mssql_1 = require("../../../config/mssql");
class InfLotInputService {
    constructor(model, pgPool) {
        this.model = model;
        this.pgPool = pgPool;
    }
    async getAll(queryParams = {}) {
        try {
            console.log('🔧 InfLotInputService.getAll called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const result = await this.model.getAll(queryParams);
            console.log(`✅ InfLotInputService.getAll: Retrieved ${result.data.length} records`);
            return {
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'INF Lot Input data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getAll:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve INF Lot Input data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getByLotNumber(lotNo) {
        try {
            console.log('🔧 InfLotInputService.getByLotNumber called:', { lotNo });
            if (!lotNo || !lotNo.trim()) {
                return {
                    success: false,
                    message: 'Lot number is required',
                    errors: ['Lot number parameter is missing or empty']
                };
            }
            const data = await this.model.getByLotNumber(lotNo.trim());
            console.log(`✅ InfLotInputService.getByLotNumber: Found ${data.length} records for lot ${lotNo}`);
            return {
                success: true,
                data,
                message: `Found ${data.length} records for lot number: ${lotNo}`
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getByLotNumber:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve lot data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getStatistics() {
        try {
            console.log('📊 InfLotInputService.getStatistics called');
            const stats = await this.model.getStatistics();
            console.log('✅ InfLotInputService.getStatistics: Retrieved statistics', stats);
            return {
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getStatistics:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFilterOptions() {
        try {
            console.log('🔧 InfLotInputService.getFilterOptions called');
            const options = await this.model.getFilterOptions();
            console.log('✅ InfLotInputService.getFilterOptions: Retrieved filter options', options);
            return {
                success: true,
                data: options,
                message: 'Filter options retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getFilterOptions:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
            };
        }
    }
    validateQueryParams(params) {
        const { page, limit } = params;
        if (page !== undefined) {
            if (!Number.isInteger(page) || page < 1) {
                return 'Page must be a positive integer';
            }
        }
        if (limit !== undefined) {
            if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
                return 'Limit must be between 1 and 200';
            }
        }
        if (params.inputDateFrom && !this.isValidDate(params.inputDateFrom)) {
            return 'Invalid inputDateFrom format. Use YYYY-MM-DD';
        }
        if (params.inputDateTo && !this.isValidDate(params.inputDateTo)) {
            return 'Invalid inputDateTo format. Use YYYY-MM-DD';
        }
        return null;
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    async healthCheck() {
        try {
            await this.model.getStatistics();
            return {
                success: true,
                message: 'INF Lot Input service is healthy',
                timestamp: new Date().toISOString(),
                service: 'inf-lotinput'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'INF Lot Input service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
                timestamp: new Date().toISOString(),
                service: 'inf-lotinput'
            };
        }
    }
    async getLastInputDate() {
        try {
            console.log('🔧 InfLotInputService.getLastInputDate called');
            const query = `
        SELECT inputdate
        FROM inf_lotinput
        ORDER BY inputdate DESC
        LIMIT 1
      `;
            const result = await this.pgPool.query(query);
            if (result.rows.length > 0 && result.rows[0].inputdate) {
                const lastInputDate = result.rows[0].inputdate.toISOString();
                console.log(`✅ InfLotInputService.getLastInputDate: Found last InputDate: ${lastInputDate}`);
                return lastInputDate;
            }
            console.log('✅ InfLotInputService.getLastInputDate: No records found, returning default date 2024-01-01');
            return '2024-01-01';
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.getLastInputDate:', error);
            return null;
        }
    }
    async sync() {
        try {
            console.log('🔧 InfLotInputService.sync called');
            const sysconfigQuery = `
        SELECT mssql_sync
        FROM sysconfig
        ORDER BY created_at DESC
        LIMIT 1
      `;
            const sysconfigResult = await this.pgPool.query(sysconfigQuery);
            if (sysconfigResult.rows.length === 0 || !sysconfigResult.rows[0].mssql_sync) {
                return {
                    success: false,
                    shouldImport: false,
                    message: 'MSSQL sync interval not configured in sysconfig'
                };
            }
            const syncIntervalMinutes = sysconfigResult.rows[0].mssql_sync;
            const lastImportQuery = `
        SELECT imported_at
        FROM inf_lotinput
        ORDER BY imported_at DESC
        LIMIT 1
      `;
            const lastImportResult = await this.pgPool.query(lastImportQuery);
            let shouldImport = false;
            let lastImportTime;
            let nextImportTime;
            if (lastImportResult.rows.length === 0) {
                console.log('✅ No previous imports found, should import');
                shouldImport = true;
            }
            else {
                lastImportTime = new Date(lastImportResult.rows[0].imported_at);
                const currentTime = new Date();
                nextImportTime = new Date(lastImportTime.getTime() + (syncIntervalMinutes * 60 * 1000));
                shouldImport = currentTime >= nextImportTime;
                console.log(`✅ Last import: ${lastImportTime.toISOString()}, Next import: ${nextImportTime.toISOString()}, Should import: ${shouldImport}`);
            }
            if (shouldImport) {
                console.log('🔄 Sync interval elapsed, triggering automatic import...');
                const lastInputDate = await this.getLastInputDate();
                const importResult = await this.importFromMssql({
                    dateFrom: lastInputDate || '2024-01-01'
                });
                return {
                    success: importResult.success,
                    shouldImport: true,
                    data: {
                        imported: importResult.imported || 0,
                        updated: importResult.updated || 0,
                        skipped: importResult.skipped || 0
                    },
                    lastImportTime,
                    nextImportTime,
                    syncIntervalMinutes,
                    message: importResult.success
                        ? `Sync completed: ${importResult.imported} imported, ${importResult.updated} updated, ${importResult.skipped} skipped`
                        : `Sync failed: ${importResult.message}`,
                    errors: importResult.errors
                };
            }
            else {
                return {
                    success: true,
                    shouldImport: false,
                    data: {
                        imported: 0,
                        updated: 0,
                        skipped: 0
                    },
                    lastImportTime,
                    nextImportTime,
                    syncIntervalMinutes,
                    message: `Import should not run yet (next import at: ${nextImportTime?.toISOString()})`
                };
            }
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.sync:', error);
            return {
                success: false,
                shouldImport: false,
                message: error instanceof Error ? error.message : 'Failed to check import status'
            };
        }
    }
    async importFromMssql(params) {
        try {
            console.log('🔄 InfLotInputService.importFromMssql started with params:', params);
            const tableName = params?.tableName || 'inf_lotinput';
            const { dateFrom, dateTo } = params || {};
            const mssqlPool = await (0, mssql_1.getMssqlPool)(this.pgPool);
            let query = `
        SELECT top 500
          Id,
          LotNo,
          PartSite,
          left(LotNo,3) as [LineNo],
          ItemNo,
          Model,
          Version,
          InputDate,
          FinishOn
        FROM dbo.Input
      `;
            const conditions = [];
            if (dateFrom) {
                conditions.push(`inputdate >= '${dateFrom}'`);
            }
            if (dateTo) {
                conditions.push(`inputdate <= '${dateTo}'`);
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ' ORDER BY inputdate DESC';
            console.log('📋 Executing MSSQL query:', query);
            const result = await mssqlPool.request().query(query);
            const records = result.recordset;
            console.log(`✅ Fetched ${records.length} records from MSSQL`);
            if (records.length === 0) {
                return {
                    success: true,
                    message: 'No records found to import',
                    imported: 0,
                    updated: 0,
                    skipped: 0
                };
            }
            let importedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;
            const errors = [];
            for (const record of records) {
                try {
                    const checkQuery = 'SELECT id FROM inf_lotinput WHERE id = $1';
                    const checkResult = await this.pgPool.query(checkQuery, [record.id]);
                    const exists = checkResult.rows.length > 0;
                    const upsertQuery = `
            INSERT INTO inf_lotinput (
              id, lotno, partsite, lineno, itemno,
              model, version, inputdate, finish_on, imported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (id)
            DO UPDATE SET
              lotno = EXCLUDED.lotno,
              partsite = EXCLUDED.partsite,
              lineno = EXCLUDED.lineno,
              itemno = EXCLUDED.itemno,
              model = EXCLUDED.model,
              version = EXCLUDED.version,
              inputdate = EXCLUDED.inputdate,
              finish_on = EXCLUDED.finish_on,
              imported_at = NOW()
          `;
                    await this.pgPool.query(upsertQuery, [
                        record.Id,
                        record.LotNo,
                        record.PartSite,
                        record.LineNo,
                        record.ItemNo,
                        record.Model,
                        record.Version,
                        record.InputDate,
                        record.FinishOn
                    ]);
                    if (exists) {
                        updatedCount++;
                    }
                    else {
                        importedCount++;
                    }
                }
                catch (error) {
                    const errorMsg = `Failed to import record ${record.Id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    console.error('❌', errorMsg);
                    errors.push(errorMsg);
                    skippedCount++;
                }
            }
            console.log(`✅ InfLotInputService.importFromMssql completed: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`);
            return {
                success: true,
                message: `Successfully processed ${records.length} records: ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped`,
                imported: importedCount,
                updated: updatedCount,
                skipped: skippedCount,
                errors: errors.length > 0 ? errors : undefined
            };
        }
        catch (error) {
            console.error('❌ Error in InfLotInputService.importFromMssql:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to import data from MSSQL',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
}
exports.InfLotInputService = InfLotInputService;
exports.default = InfLotInputService;
