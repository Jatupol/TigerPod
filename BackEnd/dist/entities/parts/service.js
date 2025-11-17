"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsService = void 0;
exports.createPartsService = createPartsService;
const generic_service_1 = require("../../generic/entities/special-entity/generic-service");
const types_1 = require("./types");
class PartsService extends generic_service_1.GenericSpecialService {
    constructor(model) {
        super(model, types_1.PARTS_ENTITY_CONFIG);
        this.partsModel = model;
    }
    async getAll(searchTerm, page, limit) {
        try {
            console.log('🔧 PartsService.getAll called', {
                searchTerm: searchTerm || 'none',
                page,
                limit
            });
            const data = await this.partsModel.getAll(searchTerm, page, limit);
            let total = data.length;
            if (page && limit) {
                total = await this.partsModel.getCount(searchTerm);
            }
            const result = {
                success: true,
                data: data
            };
            if (page && limit) {
                result.pagination = {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                };
            }
            return result;
        }
        catch (error) {
            console.error('❌ Error getting all parts:', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve parts'
            };
        }
    }
    async getByKey(keyValues) {
        try {
            const { partno } = keyValues;
            console.log('🔧 PartsService.getByKey called:', { partno });
            if (!partno) {
                return {
                    success: false,
                    message: 'Part number is required'
                };
            }
            const data = await this.partsModel.getByKey({ partno });
            if (data) {
                return {
                    success: true,
                    data: data
                };
            }
            else {
                return {
                    success: false,
                    message: 'Part not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error getting part by key:', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve part'
            };
        }
    }
    async import(data, userId = 0) {
        try {
            console.log('🔧 PartsService.create called:', { partno: data.partno, userId });
            const validation = this.validateImportData(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const createData = {
                ...data,
                created_by: userId,
                updated_by: userId
            };
            const result = await this.partsModel.replace(createData, userId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    message: 'Part created successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to create part'
                };
            }
        }
        catch (error) {
            console.error('❌ Error creating part:', error);
            return {
                success: false,
                message: error.message || 'Failed to create part'
            };
        }
    }
    async create(data, userId = 0) {
        try {
            console.log('🔧 PartsService.create called:', { partno: data.partno, userId });
            const validation = this.validateCreateData(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            let customerSiteData = null;
            if (data.customer_site_code?.trim()) {
                customerSiteData = await this.resolveCustomerSite(data.customer_site_code);
                if (!customerSiteData) {
                    return {
                        success: false,
                        message: 'Invalid customer-site code'
                    };
                }
            }
            const createData = {
                ...data,
                customer: customerSiteData?.customer || undefined,
                part_site: customerSiteData?.site || undefined,
                created_by: userId,
                updated_by: userId
            };
            const result = await this.partsModel.create(createData, userId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    message: 'Part created successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to create part'
                };
            }
        }
        catch (error) {
            console.error('❌ Error creating part:', error);
            return {
                success: false,
                message: error.message || 'Failed to create part'
            };
        }
    }
    async update(keyValues, data, userId = 0) {
        try {
            const { partno } = keyValues;
            console.log('🔧 PartsService.update called:', { partno, userId });
            if (!partno) {
                return {
                    success: false,
                    message: 'Part number is required'
                };
            }
            const updateData = {
                ...data,
                updated_by: userId
            };
            const result = await this.partsModel.update({ partno }, updateData, userId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    message: 'Part updated successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to update part'
                };
            }
        }
        catch (error) {
            console.error('❌ Error updating part:', error);
            return {
                success: false,
                message: error.message || 'Failed to update part'
            };
        }
    }
    async delete(keyValues) {
        try {
            const { partno } = keyValues;
            console.log('🔧 PartsService.delete called:', { partno });
            if (!partno) {
                return {
                    success: false,
                    message: 'Part number is required'
                };
            }
            const result = await this.partsModel.delete({ partno });
            if (result.success) {
                return {
                    success: true,
                    data: true,
                    message: 'Part deleted successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to delete part'
                };
            }
        }
        catch (error) {
            console.error('❌ Error deleting part:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete part'
            };
        }
    }
    async synceData() {
        try {
            console.log('🔧 Executing parts Synchronize data  ');
            const result = await this.partsModel.synceData();
            if (result.success) {
                return {
                    success: true,
                    data: true,
                    message: 'Part dSynchronize data successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to Synchronize data part'
                };
            }
        }
        catch (error) {
            console.error('❌ Error Synchronize data part:', error);
            return {
                success: false,
                message: error.message || 'Failed to Synchronize data part'
            };
        }
    }
    async exists(keyValues) {
        try {
            const { partno } = keyValues;
            if (!partno) {
                return false;
            }
            return await this.partsModel.exists({ partno });
        }
        catch (error) {
            console.error('❌ Error checking part existence:', error);
            return false;
        }
    }
    async resolveCustomerSite(customerSiteCode) {
        try {
            if (!customerSiteCode) {
                return null;
            }
            const result = await this.partsModel.resolveCustomerSite(customerSiteCode);
            if (result.rows.length > 0) {
                return {
                    customer: result.rows[0].customers,
                    site: result.rows[0].site
                };
            }
            return null;
        }
        catch (error) {
            console.error('❌ Error resolving customer-site:', error);
            return null;
        }
    }
    async getCustomerSites() {
        try {
            const result = await this.partsModel.getCustomerSites();
            if (result.rows.length > 0) {
                return result;
            }
            return null;
        }
        catch (error) {
            console.error('❌ Error getting customer-sites:', error);
            return null;
        }
    }
    ;
    validateCreateData(data) {
        const errors = [];
        if (!data.partno?.trim()) {
            errors.push('Part number is required');
        }
        if (!data.product_families?.trim()) {
            errors.push('Product families is required');
        }
        if (!data.versions?.trim()) {
            errors.push('Versions is required');
        }
        if (!data.production_site?.trim()) {
            errors.push('Production site is required');
        }
        if (!data.customer_site_code?.trim()) {
            errors.push('Customer-site is required');
        }
        if (!data.tab?.trim()) {
            errors.push('Tab is required');
        }
        if (!data.product_type?.trim()) {
            errors.push('Product type is required');
        }
        if (!data.customer_driver?.trim()) {
            errors.push('Customer driver is required');
        }
        if (data.partno && data.partno.length > 25) {
            errors.push('Part number must be 25 characters or less');
        }
        if (data.product_families && data.product_families.length > 10) {
            errors.push('Product families must be 10 characters or less');
        }
        if (data.versions && data.versions.length > 10) {
            errors.push('Versions must be 10 characters or less');
        }
        if (data.customer_driver && data.customer_driver.length > 200) {
            errors.push('Customer driver must be 200 characters or less');
        }
        if (data.customer_site_code && data.customer_site_code.length > 10) {
            errors.push('Customer-site code must be 10 characters or less');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateImportData(data) {
        const errors = [];
        if (!data.partno?.trim()) {
            errors.push('Part number is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.PartsService = PartsService;
function createPartsService(model) {
    return new PartsService(model);
}
exports.default = PartsService;
