"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSiteModel = void 0;
exports.createCustomerSiteModel = createCustomerSiteModel;
exports.createCustomerSiteModelGeneric = createCustomerSiteModelGeneric;
const generic_model_1 = require("../../generic/entities/special-entity/generic-model");
const types_1 = require("./types");
class CustomerSiteModel extends generic_model_1.GenericSpecialModel {
    constructor(db) {
        super(db, types_1.CUSTOMER_SITE_ENTITY_CONFIG);
    }
    async getByKey(keyValues) {
        try {
            const { code } = keyValues;
            if (!code) {
                throw new Error('Code is required');
            }
            const query = `
        SELECT
          cs.*,
          c.name as customer_name 
        FROM customers_site cs
        LEFT JOIN customers c ON cs.customers = c.code
        WHERE cs.code = $1
      `;
            const result = await this.db.query(query, [code]);
            return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
        }
        catch (error) {
            console.error('CustomerSite findByKey error:', error);
            throw new Error(`Failed to find customer-site relationship: ${error.message}`);
        }
    }
    async create(data) {
        try {
            const query = `
        INSERT INTO customers_site (
          code,
          customers,
          site,
          is_active,
          created_by,
          updated_by,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
            const values = [
                data.code,
                data.customers,
                data.site,
                data.is_active !== undefined ? data.is_active : true,
                data.created_by,
                data.updated_by,
                data.created_at || new Date(),
                data.updated_at || new Date()
            ];
            console.log('🔧 Executing customer-site create query:', { query, values });
            const result = await this.db.query(query, values);
            if (result.rows.length > 0) {
                console.log('✅ Customer-site relationship created successfully');
                return {
                    success: true,
                    data: result.rows[0]
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to create customer-site relationship'
                };
            }
        }
        catch (error) {
            console.error('❌ Error creating customer-site relationship:', error);
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Customer-site code already exists'
                };
            }
            else if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Invalid customer or site reference'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async update(keyValues, data) {
        try {
            const { code } = keyValues;
            if (!code) {
                return {
                    success: false,
                    error: 'Code is required for update'
                };
            }
            const updateFields = [];
            const values = [];
            let paramCount = 1;
            if (data.customers !== undefined) {
                updateFields.push(`customers = $${paramCount}`);
                values.push(data.customers);
                paramCount++;
            }
            if (data.site !== undefined) {
                updateFields.push(`site = $${paramCount}`);
                values.push(data.site);
                paramCount++;
            }
            if (data.is_active !== undefined) {
                updateFields.push(`is_active = $${paramCount}`);
                values.push(data.is_active);
                paramCount++;
            }
            if (data.updated_by !== undefined) {
                updateFields.push(`updated_by = $${paramCount}`);
                values.push(data.updated_by);
                paramCount++;
            }
            updateFields.push(`updated_at = $${paramCount}`);
            values.push(data.updated_at || new Date());
            paramCount++;
            if (updateFields.length === 1) {
                return {
                    success: false,
                    error: 'No fields to update'
                };
            }
            values.push(code);
            const query = `
        UPDATE customers_site
        SET ${updateFields.join(', ')}
        WHERE code = $${paramCount}
        RETURNING *
      `;
            console.log('🔧 Executing customer-site update query:', { query, values });
            const result = await this.db.query(query, values);
            if (result.rows.length > 0) {
                console.log('✅ Customer-site relationship updated successfully');
                return {
                    success: true,
                    data: result.rows[0]
                };
            }
            else {
                return {
                    success: false,
                    error: 'Customer-site relationship not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error updating customer-site relationship:', error);
            if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Invalid customer or site reference'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async delete(keyValues) {
        try {
            const { code } = keyValues;
            if (!code) {
                return {
                    success: false,
                    error: 'Code is required for deletion'
                };
            }
            const query = `
        DELETE FROM customers_site
        WHERE code = $1
      `;
            const values = [code];
            console.log('🔧 Executing customer-site delete query:', { query, values });
            const result = await this.db.query(query, values);
            if (result.rowCount && result.rowCount > 0) {
                console.log('✅ Customer-site relationship deleted successfully');
                return {
                    success: true
                };
            }
            else {
                return {
                    success: false,
                    error: 'Customer-site relationship not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error deleting customer-site relationship:', error);
            if (error.code === '23503') {
                return {
                    success: false,
                    error: 'Cannot delete customer-site relationship: it is referenced by other records'
                };
            }
            return {
                success: false,
                error: error.message || 'Database error occurred'
            };
        }
    }
    async exists(keyValues) {
        try {
            const { code } = keyValues;
            if (!code) {
                return false;
            }
            const query = `
        SELECT 1 FROM customers_site
        WHERE code = $1
        LIMIT 1
      `;
            const result = await this.db.query(query, [code]);
            return result.rows.length > 0;
        }
        catch (error) {
            console.error('CustomerSite exists error:', error);
            return false;
        }
    }
    async getAll() {
        try {
            const query = `
        SELECT
          cs.*,
          c.name as customer_name
        FROM customers_site cs
        LEFT JOIN customers c ON cs.customers = c.code 
        ORDER BY cs.site ASC
      `;
            const result = await this.db.query(query);
            return result.rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            console.error('CustomerSite findByCustomer error:', error);
            throw new Error(`Failed to find sites for customer: ${error.message}`);
        }
    }
    async getByCustomer(customerCode) {
        try {
            const query = `
        SELECT
          cs.*,
          c.name as customer_name
        FROM customers_site cs
        LEFT JOIN customers c ON cs.customers = c.code
        WHERE cs.customers = $1
        ORDER BY cs.site ASC
      `;
            const result = await this.db.query(query, [customerCode]);
            return result.rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            console.error('CustomerSite findByCustomer error:', error);
            throw new Error(`Failed to find sites for customer: ${error.message}`);
        }
    }
    async getBySite(siteCode) {
        try {
            const query = `
        SELECT
          cs.*,
          c.name as customer_name
        FROM customers_site cs
        LEFT JOIN customers c ON cs.customers = c.code
        WHERE cs.site = $1
        ORDER BY cs.customers ASC
      `;
            const result = await this.db.query(query, [siteCode]);
            return result.rows.map(row => this.mapRowToEntity(row));
        }
        catch (error) {
            console.error('CustomerSite findBySite error:', error);
            throw new Error(`Failed to find customers for site: ${error.message}`);
        }
    }
    mapRowToEntity(row) {
        return {
            code: row.code,
            customers: row.customers,
            site: row.site,
            is_active: row.is_active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
            customer_name: row.customer_name || undefined
        };
    }
    buildKeyWhereClause(keyValues) {
        const { code } = keyValues;
        return {
            clause: 'code = $1',
            params: [code]
        };
    }
}
exports.CustomerSiteModel = CustomerSiteModel;
function createCustomerSiteModel(db) {
    return new CustomerSiteModel(db);
}
function createCustomerSiteModelGeneric(db) {
    return new CustomerSiteModel(db);
}
exports.default = CustomerSiteModel;
