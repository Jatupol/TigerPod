"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfLotInputController = void 0;
class InfLotInputController {
    constructor(service) {
        this.getAll = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-lotinput - Query params:`, req.query);
                const queryParams = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50,
                    lotNoSearch: req.query.lotNoSearch,
                    itemNoSearch: req.query.itemNoSearch,
                    globalSearch: req.query.globalSearch,
                    partSite: req.query.partSite,
                    lineNo: req.query.lineNo,
                    model: req.query.model,
                    version: req.query.version,
                    status: req.query.status,
                    inputDateFrom: req.query.inputDateFrom,
                    inputDateTo: req.query.inputDateTo,
                    lotNo: req.query.lotNo,
                    itemNo: req.query.itemNo,
                    search: req.query.search
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getAll(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.getAll:', error);
                next(error);
            }
        };
        this.getByLotNumber = async (req, res, next) => {
            try {
                const { lotNumber } = req.params;
                console.log(`📋 GET /api/inf-lotinput/lot/${lotNumber}`);
                const result = await this.service.getByLotNumber(lotNumber);
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput/lot/${lotNumber} - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput/lot/${lotNumber} - Error: ${result.message}`);
                    res.status(404).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.getByLotNumber:', error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/inf-lotinput/statistics`);
                const result = await this.service.getStatistics();
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput/statistics - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput/statistics - Error: ${result.message}`);
                    res.status(500).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.getStatistics:', error);
                next(error);
            }
        };
        this.getFilterOptions = async (req, res, next) => {
            try {
                console.log(`🔧 GET /api/inf-lotinput/filter-options`);
                const result = await this.service.getFilterOptions();
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput/filter-options - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput/filter-options - Error: ${result.message}`);
                    res.status(500).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.getFilterOptions:', error);
                next(error);
            }
        };
        this.getHealth = async (req, res, next) => {
            try {
                console.log(`🏥 GET /api/inf-lotinput/health`);
                const result = await this.service.healthCheck();
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput/health - Healthy`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput/health - Unhealthy: ${result.message}`);
                    res.status(503).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.getHealth:', error);
                res.status(503).json({
                    success: false,
                    message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
                    timestamp: new Date().toISOString(),
                    service: 'inf-lotinput'
                });
            }
        };
        this.sync = async (req, res, next) => {
            try {
                console.log(`🔍 GET /api/inf-lotinput/sync`);
                const result = await this.service.sync();
                if (result.success) {
                    console.log(`✅ GET /api/inf-lotinput/sync - Success: ${result.shouldImport}`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-lotinput/sync - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.import:', error);
                next(error);
            }
        };
        this.importFromMssql = async (req, res, next) => {
            try {
                const { tableName, dateFrom, dateTo } = req.body;
                console.log(`📥 POST /api/inf-lotinput/import - Params:`, { tableName, dateFrom, dateTo });
                const result = await this.service.importFromMssql({
                    tableName,
                    dateFrom,
                    dateTo
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-lotinput/import - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-lotinput/import - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.importFromMssql:', error);
                next(error);
            }
        };
        this.importTodayData = async (req, res, next) => {
            try {
                const today = new Date().toISOString().split('T')[0];
                console.log(`📥 POST /api/inf-lotinput/import/today - Importing data for ${today}`);
                const result = await this.service.importFromMssql({
                    dateFrom: today,
                    dateTo: today
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-lotinput/import/today - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-lotinput/import/today - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.importTodayData:', error);
                next(error);
            }
        };
        this.importDateRange = async (req, res, next) => {
            try {
                const { dateFrom, dateTo } = req.body;
                console.log(`📥 POST /api/inf-lotinput/import/range - Params:`, { dateFrom, dateTo });
                if (!dateFrom || !dateTo) {
                    res.status(400).json({
                        success: false,
                        message: 'Missing required parameters: dateFrom and dateTo are required'
                    });
                    return;
                }
                const result = await this.service.importFromMssql({
                    dateFrom,
                    dateTo
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-lotinput/import/range - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-lotinput/import/range - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfLotInputController.importDateRange:', error);
                next(error);
            }
        };
        this.service = service;
    }
    parseIntWithDefault(value, defaultValue) {
        if (!value)
            return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    validateRequired(params, requiredFields) {
        for (const field of requiredFields) {
            if (!params[field]) {
                return `Missing required parameter: ${field}`;
            }
        }
        return null;
    }
}
exports.InfLotInputController = InfLotInputController;
exports.default = InfLotInputController;
