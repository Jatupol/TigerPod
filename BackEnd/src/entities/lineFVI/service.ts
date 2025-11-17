// server/src/entities/line-fvi/service.ts

/**
 * LineFvi Entity Service Implementation
 * 
 * This module implements the LineFvi entity service following the VARCHAR CODE pattern.
 * LineFvi service provides business logic for the LineFvi entity.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends GenericVarcharCodeService from VARCHAR CODE pattern
 * ✅ No direct cross-entity dependencies
 * ✅ Self-contained LineFvi business logic layer
 * ✅ 90% code reduction through generic pattern reuse
 * 
 * Business Logic Compliance:
 * - LineFvi business rules and validation
 * - Sampling Inspection Control specific logic
 * - FVI line operational status management
 * - Code and name uniqueness validation
 */

import {
  GenericVarcharCodeService,
  createVarcharCodeService
} from '../../generic/entities/varchar-code-entity/generic-service';

import {
  LineFvi,
  CreateLineFviRequest,
  UpdateLineFviRequest,
  LineFviQueryOptions,
  LineFviServiceResult,
  LineFviEntityConfig,
  LineFviConstants
} from './types';

import {
  VarcharCodePaginatedResponse,
  VarcharCodeServiceResult,
  ValidationResult,
  IVarcharCodeService
} from '../../generic/entities/varchar-code-entity/generic-types';

import { LineFviModel } from './model';

// ==================== LINE FVI SERVICE CLASS ====================

/**
 * LineFvi Service - Business logic for LineFvi entity
 * 
 * Extends GenericVarcharCodeService to inherit all standard VARCHAR CODE operations:
 * ✅ getByCode(code: string, userId: number): Promise<LineFviServiceResult<LineFvi>>
 * ✅ getAll(options: LineFviQueryOptions, userId: number): Promise<LineFviServiceResult<VarcharCodePaginatedResponse<LineFvi>>>
 * ✅ create(data: CreateLineFviRequest, userId: number): Promise<LineFviServiceResult<LineFvi>>
 * ✅ update(code: string, data: UpdateLineFviRequest, userId: number): Promise<LineFviServiceResult<LineFvi>>
 * ✅ delete(code: string, userId: number): Promise<LineFviServiceResult<boolean>>
 * ✅ changeStatus(code: string, userId: number): Promise<LineFviServiceResult<boolean>>
 * ✅ validate(data: any, operation: 'create' | 'update'): ValidationResult
 * 
 * Plus LineFvi-specific business operations and validations.
 */
export class LineFviService extends GenericVarcharCodeService<LineFvi> implements IVarcharCodeService<LineFvi> {
  
  protected model: LineFviModel;

  constructor(model: LineFviModel) {
    super(model, LineFviEntityConfig);
    this.model = model;
  }

  // ==================== LINEFVI-SPECIFIC BUSINESS OPERATIONS ====================

 
  /**
   * Check if LineFvi code is available for creation
   * Includes format validation and uniqueness check
   */
  async checkCodeAvailability(code: string, userId: number): Promise<LineFviServiceResult<{
    available: boolean;
    reasons: string[];
    suggestions: string[];
  }>> {
    try {
      const reasons: string[] = [];
      const suggestions: string[] = [];

      // Basic validation
      if (!code || code.trim().length === 0) {
        reasons.push('Code cannot be empty');
        return {
          success: true,
          data: { available: false, reasons, suggestions }
        };
      }

      const trimmedCode = code.trim().toUpperCase();

      // Length validation
      if (trimmedCode.length > LineFviConstants.CODE_MAX_LENGTH) {
        reasons.push(`Code cannot exceed ${LineFviConstants.CODE_MAX_LENGTH} characters`);
      }

      if (trimmedCode.length < LineFviConstants.CODE_MIN_LENGTH) {
        reasons.push(`Code must be at least ${LineFviConstants.CODE_MIN_LENGTH} character`);
      }

      // Pattern validation
      if (!LineFviConstants.CODE_PATTERN.test(trimmedCode)) {
        reasons.push('Code can only contain letters and numbers');
      }

      // If basic validation fails, return early
      if (reasons.length > 0) {
        return {
          success: true,
          data: { available: false, reasons, suggestions }
        };
      }

      // Check uniqueness
      const isAvailable = await this.model.isCodeAvailable(trimmedCode);
      
      if (!isAvailable) {
        reasons.push('Code is already in use');
        
        // Get similar codes for suggestions
        const similarCodes = await this.model.findSimilarCodes(trimmedCode);
        suggestions.push(...similarCodes);
      }

      return {
        success: true,
        data: {
          available: isAvailable,
          reasons,
          suggestions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
 

  // ==================== ENHANCED VALIDATION ====================

  /**
   * Enhanced validation with LineFvi-specific business rules
   * Extends the generic validation with manufacturing-specific constraints
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    // Start with generic validation
    const genericResult = super.validate(data, operation);
    
    // Add LineFvi-specific validation
    const lineFviErrors: string[] = [...genericResult.errors];

    if (operation === 'create') {
      // Validate code format for creation
      if (data.code) {
        const normalizedCode = data.code.trim().toUpperCase();
        
        if (!LineFviConstants.CODE_PATTERN.test(normalizedCode)) {
          lineFviErrors.push('Code can only contain letters and numbers');
        }
        
        if (normalizedCode.length > LineFviConstants.CODE_MAX_LENGTH) {
          lineFviErrors.push(`Code cannot exceed ${LineFviConstants.CODE_MAX_LENGTH} characters`);
        }
      }
    }

    // Validate name length
    if (data.name && data.name.trim().length > LineFviConstants.NAME_MAX_LENGTH) {
      lineFviErrors.push(`Name cannot exceed ${LineFviConstants.NAME_MAX_LENGTH} characters`);
    }

    return {
      isValid: lineFviErrors.length === 0,
      errors: lineFviErrors
    };
  }

  // ==================== MANUFACTURING-SPECIFIC HELPERS ====================

  /**
   * Check if LineFvi is operational (active and properly configured)
   * Used for production planning and quality control workflows
   */
  async isLineOperational(code: string): Promise<LineFviServiceResult<{
    operational: boolean;
    status: 'active' | 'inactive' | 'not_found';
    reasons: string[];
  }>> {
    try {
      const lineResult = await this.getByCode(code);
      
      if (!lineResult.success || !lineResult.data) {
        return {
          success: true,
          data: {
            operational: false,
            status: 'not_found',
            reasons: ['Line not found']
          }
        };
      }

      const line = lineResult.data;
      const reasons: string[] = [];

      if (!line.is_active) {
        reasons.push('Line is marked as inactive');
      }

      const operational = line.is_active && reasons.length === 0;

      return {
        success: true,
        data: {
          operational,
          status: line.is_active ? 'active' : 'inactive',
          reasons
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to check line operational status: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// ==================== FACTORY FUNCTIONS ====================

/**
 * Factory function to create LineFvi service instance
 * Uses LineFvi-specific model with enhanced functionality
 */
export function createLineFviService(model: LineFviModel): LineFviService {
  return new LineFviService(model);
}

/**
 * Alternative factory using generic pattern (for consistency)
 */
export function createLineFviServiceGeneric(model: LineFviModel): IVarcharCodeService<LineFvi> {
  return createVarcharCodeService<LineFvi>(model, LineFviEntityConfig);
}

export default LineFviService;
 