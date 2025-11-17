"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
exports.createCustomerModel = createCustomerModel;
exports.createCustomerModelGeneric = createCustomerModelGeneric;
const generic_model_1 = require("../../generic/entities/varchar-code-entity/generic-model");
const types_1 = require("./types");
class CustomerModel extends generic_model_1.GenericVarcharCodeModel {
    constructor(db) {
        super(db, types_1.CustomerEntityConfig);
    }
    async isCodeAvailable(code) {
        if (!this.isValidCustomerCode(code)) {
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
    async findByCodePrefix(codePrefix, limit = 10) {
        const query = `
      SELECT code, name FROM ${this.config.tableName}
      WHERE code ILIKE $1 AND is_active = true
      ORDER BY code ASC
      LIMIT $2
    `;
        try {
            const result = await this.db.query(query, [`${codePrefix}%`, limit]);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to find customers by code prefix: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getRelationshipCounts(customerCode) {
        const queries = [
            `SELECT COUNT(*) as count FROM customers_site WHERE customers = $1`,
            `SELECT COUNT(*) as count FROM parts WHERE customer = $1`
        ];
        try {
            const [customerSitesResult, partsResult] = await Promise.all(queries.map(query => this.db.query(query, [customerCode])));
            return {
                customerSites: parseInt(customerSitesResult.rows[0].count) || 0,
                parts: parseInt(partsResult.rows[0].count) || 0
            };
        }
        catch (error) {
            throw new Error(`Failed to get relationship counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    isValidCustomerCode(code) {
        if (!code || typeof code !== 'string') {
            return false;
        }
        const trimmedCode = code.trim();
        if (trimmedCode.length < types_1.CustomerConstants.CODE_MIN_LENGTH ||
            trimmedCode.length > types_1.CustomerConstants.CODE_MAX_LENGTH) {
            return false;
        }
        return types_1.CustomerConstants.CODE_PATTERN.test(trimmedCode);
    }
}
exports.CustomerModel = CustomerModel;
function createCustomerModel(db) {
    return new CustomerModel(db);
}
function createCustomerModelGeneric(db) {
    return (0, generic_model_1.createVarcharCodeModel)(db, types_1.CustomerEntityConfig);
}
exports.default = CustomerModel;
