"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionDataService = void 0;
exports.createInspectionDataService = createInspectionDataService;
const generic_service_1 = require("../../generic/entities/special-entity/generic-service");
const fiscalWeek_1 = require("../../utils/fiscalWeek");
const types_1 = require("./types");
class InspectionDataService extends generic_service_1.GenericSpecialService {
    constructor(model) {
        super(model, types_1.INSPECTIONDATA_ENTITY_CONFIG);
        this.inspectionDataModel = model;
    }
    async getAll(searchTerm, options) {
        try {
            const page = options?.page && options.page > 0 ? options.page : 1;
            const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
            console.log('🔧 InspectionDataService.getAll called', searchTerm ? `with search: "${searchTerm}"` : '', `page=${page}, limit=${limit}`, options?.station ? `station=${options.station}` : '');
            const data = await this.inspectionDataModel.getAllWithDefects(searchTerm, options);
            const totalCount = await this.inspectionDataModel.getCount(searchTerm, options?.station);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                success: true,
                data: data,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            };
        }
        catch (error) {
            console.error('❌ Error getting all inspection data:', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve inspection data'
            };
        }
    }
    async getAllCustomer(searchTerm, options) {
        try {
            const page = options?.page && options.page > 0 ? options.page : 1;
            const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
            const data = await this.inspectionDataModel.getAllWithDefectsCustomer(searchTerm, options);
            const totalCount = await this.inspectionDataModel.getCountCustomer(searchTerm, options?.station);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                success: true,
                data: data,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            };
        }
        catch (error) {
            console.error('❌ Error getting all inspection data:', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve inspection data'
            };
        }
    }
    async getByKey(keyValues) {
        try {
            const { id } = keyValues;
            console.log('🔧 InspectionDataService.getByKey called:', { id });
            if (!id) {
                return {
                    success: false,
                    message: 'ID is required'
                };
            }
            const data = await this.inspectionDataModel.getByKey({ id });
            if (data) {
                return {
                    success: true,
                    data: data
                };
            }
            else {
                return {
                    success: false,
                    message: 'Inspection data not found'
                };
            }
        }
        catch (error) {
            console.error('❌ Error getting inspection data by key:', error);
            return {
                success: false,
                message: error.message || 'Failed to retrieve inspection data'
            };
        }
    }
    async create(data, userId = 0) {
        try {
            console.log('🔧 InspectionDataService.create called:', { inspection_no: data.inspection_no, station: data.station, userId });
            const validation = this.validateCreateData(data);
            if (!validation.isValid) {
                console.error('❌ Validation failed:', validation.errors);
                return {
                    success: false,
                    message: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            let samplingRound = data.round;
            if (!samplingRound && data.station && data.lotno) {
                samplingRound = await this.calculateSamplingRound(data.station, data.lotno);
                console.log(`🔢 Calculated sampling round for station=${data.station}, lotno=${data.lotno}: ${samplingRound}`);
            }
            const createData = {
                ...data,
                round: samplingRound || 0,
                created_by: userId,
                updated_by: userId
            };
            const result = await this.inspectionDataModel.create(createData, userId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    message: 'Inspection data created successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to create inspection data'
                };
            }
        }
        catch (error) {
            console.error('❌ Error creating inspection data:', error);
            return {
                success: false,
                message: error.message || 'Failed to create inspection data'
            };
        }
    }
    async calculateSamplingRound(station, lotno) {
        try {
            const result = await this.inspectionDataModel.getSamplingRoundCount(station, lotno);
            return result + 1;
        }
        catch (error) {
            console.error('❌ Error calculating sampling round:', error);
            return 1;
        }
    }
    async getSamplingRoundCount(station, lotno) {
        try {
            return await this.inspectionDataModel.getSamplingRoundCount(station, lotno);
        }
        catch (error) {
            console.error('❌ Error getting sampling round count:', error);
            throw error;
        }
    }
    async generateInspectionNumber(station, inspectionDate, ww) {
        try {
            return await this.inspectionDataModel.generateInspectionNumber(station, inspectionDate, ww);
        }
        catch (error) {
            console.error('❌ Error generating inspection number:', error);
            throw error;
        }
    }
    async createSIVFromOQA(oqaInspectionId, userId = 0) {
        try {
            console.log('🔧 Creating SIV inspection from OQA inspection:', oqaInspectionId);
            const oqaResult = await this.getByKey({ id: oqaInspectionId });
            if (!oqaResult.success || !oqaResult.data) {
                return {
                    success: false,
                    message: `Inspection not found for ID: ${oqaInspectionId}`
                };
            }
            const oqaInspection = oqaResult.data;
            const currentDate = new Date();
            const wwNumber = (0, fiscalWeek_1.calculateFiscalWeekNumber)(currentDate);
            const fy = (0, fiscalWeek_1.getFiscalYear)(currentDate);
            const sivInspectionNo = await this.inspectionDataModel.generateInspectionNumber('SIV', currentDate, wwNumber.toString());
            console.log('📋 Generated SIV inspection number:', sivInspectionNo);
            const sivRound = await this.calculateSamplingRound('SIV', oqaInspection.lotno);
            console.log(`🔢 Calculated SIV round for lotno ${oqaInspection.lotno}: ${sivRound}`);
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const monthYear = `${year}-${month}`;
            const sivData = {
                station: 'SIV',
                inspection_no: sivInspectionNo,
                inspection_no_ref: oqaInspection.inspection_no,
                inspection_date: currentDate,
                fy: fy.toString(),
                ww: wwNumber.toString(),
                month_year: monthYear,
                shift: '-',
                lotno: oqaInspection.lotno,
                partsite: oqaInspection.partsite,
                itemno: oqaInspection.itemno,
                model: oqaInspection.model,
                version: oqaInspection.version,
                mclineno: oqaInspection.mclineno,
                fvilineno: '-',
                sampling_reason_id: oqaInspection.sampling_reason_id,
                round: sivRound,
                qc_id: 0,
                fvi_lot_qty: oqaInspection.fvi_lot_qty,
                general_sampling_qty: 0,
                crack_sampling_qty: 0
            };
            console.log('📝 Creating SIV inspection with data:', sivData);
            const result = await this.create(sivData, userId);
            const result2 = await this.inspectionDataModel.updateFviToDefault(sivInspectionNo);
            if (result.success) {
                console.log('✅ SIV inspection created successfully:', result.data?.id);
            }
            return result;
        }
        catch (error) {
            console.error('❌ Error creating SIV inspection from OQA:', error);
            return {
                success: false,
                message: error.message || 'Failed to create SIV inspection'
            };
        }
    }
    async update(keyValues, data, userId = 0) {
        try {
            const { id } = keyValues;
            console.log('🔧 InspectionDataService.update called:', { id, userId });
            if (!id) {
                return {
                    success: false,
                    message: 'ID is required'
                };
            }
            const updateData = {
                ...data,
                updated_by: userId
            };
            const result = await this.inspectionDataModel.update({ id }, updateData, userId);
            if (result.success && result.data) {
                return {
                    success: true,
                    data: result.data,
                    message: 'Inspection data updated successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to update inspection data'
                };
            }
        }
        catch (error) {
            console.error('❌ Error updating inspection data:', error);
            return {
                success: false,
                message: error.message || 'Failed to update inspection data'
            };
        }
    }
    async delete(keyValues) {
        try {
            const { id } = keyValues;
            console.log('🔧 InspectionDataService.delete called:', { id });
            if (!id) {
                return {
                    success: false,
                    message: 'ID is required'
                };
            }
            const result = await this.inspectionDataModel.delete({ id });
            if (result.success) {
                return {
                    success: true,
                    data: true,
                    message: 'Inspection data deleted successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: result.error || 'Failed to delete inspection data'
                };
            }
        }
        catch (error) {
            console.error('❌ Error deleting inspection data:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete inspection data'
            };
        }
    }
    async exists(keyValues) {
        try {
            const { id } = keyValues;
            if (!id) {
                return false;
            }
            return await this.inspectionDataModel.exists({ id });
        }
        catch (error) {
            console.error('❌ Error checking inspection data existence:', error);
            return false;
        }
    }
    async getStationStatistics(station) {
        try {
            const result = await this.inspectionDataModel.getStationStatistics(station);
            return result;
        }
        catch (error) {
            console.error(`Error getting station statistics for ${station}:`, error);
            throw error;
        }
    }
    async getWeeklyTrend(station) {
        try {
            const result = await this.inspectionDataModel.getWeeklyTrend(station);
            return result;
        }
        catch (error) {
            console.error(`Error getting weekly trend for ${station}:`, error);
            throw error;
        }
    }
    validateCreateData(data) {
        const errors = [];
        const isSIV = data.station?.toUpperCase() === 'SIV';
        if (!data.station?.trim()) {
            errors.push('Station is required');
        }
        if (!data.inspection_no?.trim()) {
            errors.push('Inspection number is required');
        }
        if (!data.month_year?.trim()) {
            errors.push('Month year is required');
        }
        if (!isSIV && !data.shift?.trim()) {
            errors.push('Shift is required');
        }
        if (!data.lotno?.trim()) {
            errors.push('Lot number is required');
        }
        if (!isSIV && !data.fvilineno?.trim()) {
            errors.push('FVI line number is required');
        }
        if (data.station && data.station.length > 3) {
            errors.push('Station must be 3 characters or less');
        }
        if (data.inspection_no && data.inspection_no.length > 20) {
            errors.push('Inspection number must be 20 characters or less');
        }
        if (data.month_year && data.month_year.length > 20) {
            errors.push('Month year must be 20 characters or less');
        }
        if (data.shift && data.shift.length > 1) {
            errors.push('Shift must be 1 character');
        }
        if (data.lotno && data.lotno.length > 30) {
            errors.push('Lot number must be 30 characters or less');
        }
        if (data.partsite && data.partsite.length > 10) {
            errors.push('Part site must be 10 characters or less');
        }
        if (data.mclineno && data.mclineno.length > 5) {
            errors.push('Machine line number must be 5 characters or less');
        }
        if (data.itemno && data.itemno.length > 30) {
            errors.push('Item number must be 30 characters or less');
        }
        if (data.model && data.model.length > 100) {
            errors.push('Model must be 100 characters or less');
        }
        if (data.version && data.version.length > 100) {
            errors.push('Version must be 100 characters or less');
        }
        if (data.fvilineno && data.fvilineno.length > 5) {
            errors.push('FVI line number must be 5 characters or less');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.InspectionDataService = InspectionDataService;
function createInspectionDataService(model) {
    return new InspectionDataService(model);
}
exports.default = InspectionDataService;
