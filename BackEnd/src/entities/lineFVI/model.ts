// server/src/entities/line-fvi/model.ts

/**
 * LineFvi Entity Model Implementation
 * 
 * This module implements the LineFvi entity model following the VARCHAR CODE pattern.
 * LineFvi model provides database operations for the line_fvi table.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericVarcharCodeModel from VARCHAR CODE pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained LineFvi data access layer
 * ✅ Works with existing PostgreSQL schema unchanged
 * ✅ 90% code reduction through generic pattern reuse
 * 
 * Database Schema Compliance:
 * - Table: line_fvi
 * - Primary Key: code VARCHAR(5) PRIMARY KEY
 * - Fields: code, name, is_active, created_by, updated_by, created_at, updated_at
 */

import { Pool } from 'pg';
import {
  GenericVarcharCodeModel,
  createVarcharCodeModel
} from '../../generic/entities/varchar-code-entity/generic-model';

import {
  LineFvi,
  CreateLineFviRequest,
  UpdateLineFviRequest,
  LineFviQueryOptions,
  LineFviEntityConfig,
  LineFviConstants
} from './types';

import {
  VarcharCodePaginatedResponse,
  IVarcharCodeModel
} from '../../generic/entities/varchar-code-entity/generic-types';

// ==================== LINE FVI MODEL CLASS ====================

/**
 * LineFvi Model - Database operations for LineFvi entity
 * 
 * Extends GenericVarcharCodeModel to inherit all standard VARCHAR CODE operations:
 * ✅ findByCode(code: string): Promise<LineFvi | null>
 * ✅ findAll(options?: LineFviQueryOptions): Promise<VarcharCodePaginatedResponse<LineFvi>>
 * ✅ create(data: CreateLineFviRequest, userId: number): Promise<LineFvi>
 * ✅ update(code: string, data: UpdateLineFviRequest, userId: number): Promise<LineFvi>
 * ✅ delete(code: string, userId: number): Promise<boolean>
 * ✅ changeStatus(code: string, userId: number): Promise<boolean>
 * ✅ exists(code: string): Promise<boolean>
 * ✅ count(options?: LineFviQueryOptions): Promise<number>
 * 
 * Plus LineFvi-specific business operations when needed.
 */
export class LineFviModel extends GenericVarcharCodeModel<LineFvi> implements IVarcharCodeModel<LineFvi> {
  
  constructor(db: Pool) {
    super(db, LineFviEntityConfig);
  }

  // ==================== LINEFVI-SPECIFIC OPERATIONS ====================
 

  /**
   * Check if LineFvi code is available for creation
   * Validates code format and uniqueness
   */
  async isCodeAvailable(code: string): Promise<boolean> {
    // Validate code format
    if (!this.isValidLineFviCode(code)) {
      return false;
    }

    try {
      const exists = await this.exists(code);
      return !exists;
    } catch (error) {
      throw new Error(`Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find LineFvi entities with similar codes
   * Useful for preventing similar codes during creation
   */
  async findSimilarCodes(code: string): Promise<string[]> {
    const query = `
      SELECT code FROM ${this.config.tableName}
      WHERE code ILIKE $1 AND code != $2
      ORDER BY code ASC
      LIMIT 5
    `;

    try {
      const result = await this.db.query(query, [`%${code}%`, code]);
      return result.rows.map(row => row.code);
    } catch (error) {
      throw new Error(`Failed to find similar codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  

  // ==================== LINEFVI-SPECIFIC VALIDATION HELPERS ====================

  /**
   * Validate LineFvi code format
   * Must be 1-5 characters, alphanumeric and uppercase
   */
  private isValidLineFviCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false;
    }

    const trimmedCode = code.trim();
    
    // Check length
    if (trimmedCode.length < LineFviConstants.CODE_MIN_LENGTH || 
        trimmedCode.length > LineFviConstants.CODE_MAX_LENGTH) {
      return false;
    }

    // Check pattern (alphanumeric, uppercase)
    return LineFviConstants.CODE_PATTERN.test(trimmedCode);
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create LineFvi model instance
 * Uses the generic factory with LineFvi-specific configuration
 */
export function createLineFviModel(db: Pool): LineFviModel {
  return new LineFviModel(db);
}

/**
 * Alternative factory using generic pattern (for consistency)
 */
export function createLineFviModelGeneric(db: Pool): IVarcharCodeModel<LineFvi> {
  return createVarcharCodeModel<LineFvi>(db, LineFviEntityConfig);
}

export default LineFviModel;

 