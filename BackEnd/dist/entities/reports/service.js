"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
exports.createReportService = createReportService;
class ReportService {
    constructor(model) {
        this.model = model;
    }
    async getLARChart(queryParams = {}) {
        try {
            console.log('🔧 LARReportService.getLARChart called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const data = await this.model.getLARChart(queryParams);
            console.log(`✅ LARReportService.getLARChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'LAR chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getLARChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve LAR chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getLARDefect(queryParams = {}) {
        try {
            console.log('🔧 LARReportService.getLARDefect called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const data = await this.model.getLARDefect(queryParams);
            console.log(`✅ LARReportService.getLARDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'LAR defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getLARDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve LAR defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    validateQueryParams(params) {
        if (params.wwFrom && !this.isValidWorkWeek(params.wwFrom)) {
            return `Invalid work week format for wwFrom: ${params.wwFrom}. Expected format: xx (e.g., 01, 52)`;
        }
        if (params.wwTo && !this.isValidWorkWeek(params.wwTo)) {
            return `Invalid work week format for wwTo: ${params.wwTo}. Expected format: xx (e.g., 01, 52)`;
        }
        return null;
    }
    isValidWorkWeek(ww) {
        const wwPattern = /^\d{2}$/i;
        return wwPattern.test(ww);
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    async getAvailableModels() {
        try {
            console.log('🔧 LARReportService.getAvailableModels called');
            const models = await this.model.getAvailableModels();
            console.log(`✅ LARReportService.getAvailableModels: Retrieved ${models.length} models`);
            return {
                success: true,
                data: models,
                message: 'Available models retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getAvailableModels:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get available models',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFiscalYears() {
        try {
            console.log('🔧 LARReportService.getFiscalYears called');
            const fiscalYears = await this.model.getFiscalYears();
            console.log(`✅ LARReportService.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);
            return {
                success: true,
                data: fiscalYears,
                message: 'Fiscal years retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getFiscalYears:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get fiscal years',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getWorkWeeks(fiscalYear) {
        try {
            console.log('🔧 LARReportService.getWorkWeeks called with fiscalYear:', fiscalYear);
            const workWeeks = await this.model.getWorkWeeks(fiscalYear);
            console.log(`✅ LARReportService.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);
            return {
                success: true,
                data: workWeeks,
                message: 'Work weeks retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getWorkWeeks:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get work weeks',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSeagateIQAResult(params) {
        try {
            console.log('🔧 ReportService.getSeagateIQAResult called with params:', params);
            if (!params.year || !params.ww) {
                return {
                    success: false,
                    message: 'Year and WW parameters are required',
                    errors: ['Missing required parameters: year and ww']
                };
            }
            const data = await this.model.getSeagateIQAResult(params);
            console.log(`✅ ReportService.getSeagateIQAResult: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Seagate IQA Result data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSeagateIQAResult:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve Seagate IQA Result data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOQADppmOverallChart(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getOQADppmOverallChart called with params:', queryParams);
            const data = await this.model.getOQADppmOverallChart(queryParams);
            console.log(`✅ ReportService.getOQADppmOverallChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOQADppmOverallChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOQADppmOverallDefect(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getOQADppmOverallDefect called with params:', queryParams);
            const data = await this.model.getOQADppmOverallDefect(queryParams);
            console.log(`✅ ReportService.getOQADppmOverallDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOQADppmOverallDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSGTIQATrendChart(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getSGTIQATrendChart called with params:', queryParams);
            const data = await this.model.getSGTIQATrendChart(queryParams);
            console.log(`✅ ReportService.getSGTIQATrendChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSGTIQATrendChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSGTIQATrendDefect(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getSGTIQATrendDefect called with params:', queryParams);
            const data = await this.model.getSGTIQATrendDefect(queryParams);
            console.log(`✅ ReportService.getSGTIQATrendDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSGTIQATrendDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
}
exports.ReportService = ReportService;
function createReportService(model) {
    return new ReportService(model);
}
exports.default = ReportService;
