"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineFviService = void 0;
exports.createLineFviService = createLineFviService;
exports.createLineFviServiceGeneric = createLineFviServiceGeneric;
const generic_service_1 = require("../../generic/entities/varchar-code-entity/generic-service");
const types_1 = require("./types");
class LineFviService extends generic_service_1.GenericVarcharCodeService {
    constructor(model) {
        super(model, types_1.LineFviEntityConfig);
        this.model = model;
    }
    async checkCodeAvailability(code, userId) {
        try {
            const reasons = [];
            const suggestions = [];
            if (!code || code.trim().length === 0) {
                reasons.push('Code cannot be empty');
                return {
                    success: true,
                    data: { available: false, reasons, suggestions }
                };
            }
            const trimmedCode = code.trim().toUpperCase();
            if (trimmedCode.length > types_1.LineFviConstants.CODE_MAX_LENGTH) {
                reasons.push(`Code cannot exceed ${types_1.LineFviConstants.CODE_MAX_LENGTH} characters`);
            }
            if (trimmedCode.length < types_1.LineFviConstants.CODE_MIN_LENGTH) {
                reasons.push(`Code must be at least ${types_1.LineFviConstants.CODE_MIN_LENGTH} character`);
            }
            if (!types_1.LineFviConstants.CODE_PATTERN.test(trimmedCode)) {
                reasons.push('Code can only contain letters and numbers');
            }
            if (reasons.length > 0) {
                return {
                    success: true,
                    data: { available: false, reasons, suggestions }
                };
            }
            const isAvailable = await this.model.isCodeAvailable(trimmedCode);
            if (!isAvailable) {
                reasons.push('Code is already in use');
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
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validate(data, operation) {
        const genericResult = super.validate(data, operation);
        const lineFviErrors = [...genericResult.errors];
        if (operation === 'create') {
            if (data.code) {
                const normalizedCode = data.code.trim().toUpperCase();
                if (!types_1.LineFviConstants.CODE_PATTERN.test(normalizedCode)) {
                    lineFviErrors.push('Code can only contain letters and numbers');
                }
                if (normalizedCode.length > types_1.LineFviConstants.CODE_MAX_LENGTH) {
                    lineFviErrors.push(`Code cannot exceed ${types_1.LineFviConstants.CODE_MAX_LENGTH} characters`);
                }
            }
        }
        if (data.name && data.name.trim().length > types_1.LineFviConstants.NAME_MAX_LENGTH) {
            lineFviErrors.push(`Name cannot exceed ${types_1.LineFviConstants.NAME_MAX_LENGTH} characters`);
        }
        return {
            isValid: lineFviErrors.length === 0,
            errors: lineFviErrors
        };
    }
    async isLineOperational(code) {
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
            const reasons = [];
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
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check line operational status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
exports.LineFviService = LineFviService;
function createLineFviService(model) {
    return new LineFviService(model);
}
function createLineFviServiceGeneric(model) {
    return (0, generic_service_1.createVarcharCodeService)(model, types_1.LineFviEntityConfig);
}
exports.default = LineFviService;
