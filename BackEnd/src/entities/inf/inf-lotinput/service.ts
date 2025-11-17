// server/src/entities/inf/inf-lotinput/service.ts
// ===== SIMPLIFIED INF LOT INPUT SERVICE =====
// Data Display Only - Business Logic for Search and Retrieval
// Sampling Inspection Control System - Simplified Read-Only Service

import {
  InfLotInputRecord,
  InfLotInputQueryParams,
  InfLotInputServiceResult,
  InfLotInputListResult,
  InfLotInputStatsResult,
  ImportStats
} from './types';
import { InfLotInputModel } from './model';
import { getMssqlPool } from '../../../config/mssql';
import { Pool as PgPool } from 'pg';

/**
 * Simplified INF Lot Input Service - Focus on business logic for data retrieval only
 */
export class InfLotInputService {
  private model: InfLotInputModel;
  private pgPool: PgPool;

  constructor(model: InfLotInputModel, pgPool?: PgPool) {
    this.model = model;
    this.pgPool = pgPool as PgPool;
  }

  // ==================== CORE BUSINESS OPERATIONS ====================

  /**
   * Get all records with filtering and pagination
   */
  async getAll(queryParams: InfLotInputQueryParams = {}): Promise<InfLotInputListResult> {
    try {
      console.log('🔧 InfLotInputService.getAll called with params:', queryParams);

      // Validate parameters
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

    } catch (error) {
      console.error('❌ Error in InfLotInputService.getAll:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve INF Lot Input data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get records by lot number
   */
  async getByLotNumber(lotNo: string): Promise<InfLotInputListResult> {
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

    } catch (error) {
      console.error('❌ Error in InfLotInputService.getByLotNumber:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve lot data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<InfLotInputStatsResult> {
    try {
      console.log('📊 InfLotInputService.getStatistics called');

      const stats = await this.model.getStatistics();

      console.log('✅ InfLotInputService.getStatistics: Retrieved statistics', stats);

      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfLotInputService.getStatistics:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve statistics',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get filter options for dropdowns
   */
  async getFilterOptions(): Promise<{
    success: boolean;
    data?: {
      partSites: string[];
      lineNos: string[];
      models: string[];
      versions: string[];
    };
    message?: string;
  }> {
    try {
      console.log('🔧 InfLotInputService.getFilterOptions called');

      const options = await this.model.getFilterOptions();

      console.log('✅ InfLotInputService.getFilterOptions: Retrieved filter options', options);

      return {
        success: true,
        data: options,
        message: 'Filter options retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Error in InfLotInputService.getFilterOptions:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve filter options'
      };
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate query parameters
   */
  private validateQueryParams(params: InfLotInputQueryParams): string | null {
    const { page, limit } = params;

    // Validate page
    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        return 'Page must be a positive integer';
      }
    }

    // Validate limit
    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
        return 'Limit must be between 1 and 200';
      }
    }

    // Validate date formats
    if (params.inputDateFrom && !this.isValidDate(params.inputDateFrom)) {
      return 'Invalid inputDateFrom format. Use YYYY-MM-DD';
    }

    if (params.inputDateTo && !this.isValidDate(params.inputDateTo)) {
      return 'Invalid inputDateTo format. Use YYYY-MM-DD';
    }

    return null;
  }

  /**
   * Check if date string is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    service: string;
  }> {
    try {
      // Try to get basic statistics to verify database connectivity
      await this.model.getStatistics();

      return {
        success: true,
        message: 'INF Lot Input service is healthy',
        timestamp: new Date().toISOString(),
        service: 'inf-lotinput'
      };

    } catch (error) {
      return {
        success: false,
        message: 'INF Lot Input service is unhealthy: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString(),
        service: 'inf-lotinput'
      };
    }
  }

  // ==================== IMPORT FROM MSSQL ====================

  /**
   * Get the last InputDate timestamp from PostgreSQL inf_lotinput table
   */
  async getLastInputDate(): Promise<string | null> {
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

    } catch (error) {
      console.error('❌ Error in InfLotInputService.getLastInputDate:', error);
      return null;
    }
  }

  /**
   * Check if import should run based on last import time and mssql_sync interval
   * If import should run, automatically trigger the import
   * @returns Object with import results and metadata
   */
  async sync(): Promise<{
    success: boolean;
    shouldImport?: boolean;
    data?: {
      imported: number;
      updated: number;
      skipped: number;
    };
    lastImportTime?: Date;
    nextImportTime?: Date;
    syncIntervalMinutes?: number;
    message: string;
    errors?: string[];
  }> {
    try {
      console.log('🔧 InfLotInputService.sync called');

      // Get mssql_sync value from sysconfig
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

      // Get last import time from inf_lotinput.imported_at
      const lastImportQuery = `
        SELECT imported_at
        FROM inf_lotinput
        ORDER BY imported_at DESC
        LIMIT 1
      `;
      const lastImportResult = await this.pgPool.query(lastImportQuery);

      let shouldImport = false;
      let lastImportTime: Date | undefined;
      let nextImportTime: Date | undefined;

      if (lastImportResult.rows.length === 0) {
        // No previous imports, should import
        console.log('✅ No previous imports found, should import');
        shouldImport = true;
      } else {
        lastImportTime = new Date(lastImportResult.rows[0].imported_at);
        const currentTime = new Date();
        nextImportTime = new Date(lastImportTime.getTime() + (syncIntervalMinutes * 60 * 1000));
        shouldImport = currentTime >= nextImportTime;

        console.log(`✅ Last import: ${lastImportTime.toISOString()}, Next import: ${nextImportTime.toISOString()}, Should import: ${shouldImport}`);
      }

      // If should import, trigger the import automatically
      if (shouldImport) {
        console.log('🔄 Sync interval elapsed, triggering automatic import...');

        // Get last InputDate to continue from where we left off
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
      } else {
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

    } catch (error) {
      console.error('❌ Error in InfLotInputService.sync:', error);
      return {
        success: false,
        shouldImport: false,
        message: error instanceof Error ? error.message : 'Failed to check import status'
      };
    }
  }

  /**
   * Import data from MSSQL database to PostgreSQL inf_lotinput table
   * @param tableName - Source table name in MSSQL (optional, defaults to inf_lotinput)
   * @param dateFrom - Start date for import (optional)
   * @param dateTo - End date for import (optional)
   */
  async importFromMssql(params?: {
    tableName?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    message: string;
    imported?: number;
    updated?: number;
    skipped?: number;
    errors?: string[];
  }> {
    try {
      console.log('🔄 InfLotInputService.importFromMssql started with params:', params);

      const tableName = params?.tableName || 'inf_lotinput';
      const { dateFrom, dateTo } = params || {};

      // Get MSSQL connection with config from sysconfig table
      const mssqlPool = await getMssqlPool(this.pgPool);

      // Build query with optional date filters
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

      const conditions: string[] = [];
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

      // Fetch data from MSSQL
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

      // Insert records into PostgreSQL using UPSERT with tracking
      let importedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          // Check if record exists to determine insert vs update
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
          } else {
            importedCount++;
          }
        } catch (error) {
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

    } catch (error) {
      console.error('❌ Error in InfLotInputService.importFromMssql:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import data from MSSQL',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export default InfLotInputService;