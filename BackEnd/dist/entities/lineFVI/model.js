"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineFviModel = void 0;
exports.createLineFviModel = createLineFviModel;
exports.createLineFviModelGeneric = createLineFviModelGeneric;
const generic_model_1 = require("../../generic/entities/varchar-code-entity/generic-model");
const types_1 = require("./types");
class LineFviModel extends generic_model_1.GenericVarcharCodeModel {
    constructor(db) {
        super(db, types_1.LineFviEntityConfig);
    }
    async isCodeAvailable(code) {
        if (!this.isValidLineFviCode(code)) {
            return false;
        }
        try {
            const exists = await this.exists(code);
            return !exists;
        }
        catch (error) {
            throw new Error(`Failed to check code availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findSimilarCodes(code) {
        const query = `
      SELECT code FROM ${this.config.tableName}
      WHERE code ILIKE $1 AND code != $2
      ORDER BY code ASC
      LIMIT 5
    `;
        try {
            const result = await this.db.query(query, [`%${code}%`, code]);
            return result.rows.map(row => row.code);
        }
        catch (error) {
            throw new Error(`Failed to find similar codes: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    isValidLineFviCode(code) {
        if (!code || typeof code !== 'string') {
            return false;
        }
        const trimmedCode = code.trim();
        if (trimmedCode.length < types_1.LineFviConstants.CODE_MIN_LENGTH ||
            trimmedCode.length > types_1.LineFviConstants.CODE_MAX_LENGTH) {
            return false;
        }
        return types_1.LineFviConstants.CODE_PATTERN.test(trimmedCode);
    }
}
exports.LineFviModel = LineFviModel;
function createLineFviModel(db) {
    return new LineFviModel(db);
}
function createLineFviModelGeneric(db) {
    return (0, generic_model_1.createVarcharCodeModel)(db, types_1.LineFviEntityConfig);
}
exports.default = LineFviModel;
