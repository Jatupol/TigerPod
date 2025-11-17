"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
exports.createeportController = createeportController;
class ReportController {
    constructor(service) {
        this.getLARChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report-lar/chart - Query params:`, req.query);
                const queryParams = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getLARChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getLARChart:', error);
                next(error);
            }
        };
        this.getLARDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report-lar/defect - Query params:`, req.query);
                const queryParams = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getLARDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getLARDefect:', error);
                next(error);
            }
        };
        this.getAvailableModels = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/report-lar/models`);
                const result = await this.service.getAvailableModels();
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/models - Success: ${result.data?.length || 0} models`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/models - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getAvailableModels:', error);
                next(error);
            }
        };
        this.getFiscalYears = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/report-lar/fiscal-years`);
                const result = await this.service.getFiscalYears();
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/fiscal-years - Success: ${result.data?.length || 0} fiscal years`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/fiscal-years - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getFiscalYears:', error);
                next(error);
            }
        };
        this.getWorkWeeks = async (req, res, next) => {
            try {
                const fiscalYear = req.query.fy;
                console.log(`📋 GET /api/report-lar/work-weeks - fiscalYear:`, fiscalYear);
                const result = await this.service.getWorkWeeks(fiscalYear);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/work-weeks - Success: ${result.data?.length || 0} work weeks`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/work-weeks - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getWorkWeeks:', error);
                next(error);
            }
        };
        this.getSeagateIQAResult = async (req, res, next) => {
            try {
                const year = req.query.year;
                const ww = req.query.ww;
                console.log(`📊 GET /api/report-lar/seagate-iqa-result - Query params:`, { year, ww });
                if (!year || !ww) {
                    res.status(400).json({
                        success: false,
                        message: 'Year and WW parameters are required'
                    });
                    return;
                }
                const result = await this.service.getSeagateIQAResult({ year, ww });
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/seagate-iqa-result - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/seagate-iqa-result - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSeagateIQAResult:', error);
                next(error);
            }
        };
        this.getOQADppmOverallChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/oqa-dppm-overall-chart - Query params:`, req.query);
                const queryParams = {
                    year: req.query.year,
                    ww: req.query.ww
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getOQADppmOverallChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/oqa-dppm-overall-chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOQADPPMOverallChart:', error);
                next(error);
            }
        };
        this.getOQADppmOverallDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/oqa-dppm-overall-defect - Query params:`, req.query);
                const queryParams = {
                    year: req.query.year,
                    ww: req.query.ww
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getOQADppmOverallDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/oqa-dppm-overall-defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/oqa-dppm-overall-defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOQADPPMOverallDefect:', error);
                next(error);
            }
        };
        this.getSGTIQATrendChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/sgt-iqa-trend-chart - Query params:`, req.query);
                const queryParams = {
                    year: req.query.year,
                    ww: req.query.ww,
                    model: req.query.model,
                    product_type: req.query.product_type
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSGTIQATrendChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/sgt-iqa-trend-chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/sgt-iqa-trend-chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSGTIQATrendChart:', error);
                next(error);
            }
        };
        this.getSGTIQATrendDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/sgt-iqa-trend-defect - Query params:`, req.query);
                const queryParams = {
                    year: req.query.year,
                    ww: req.query.ww,
                    model: req.query.model,
                    product_type: req.query.product_type
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSGTIQATrendDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/sgt-iqa-trend-defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/sgt-iqa-trend-defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSGTIQATrendDefect:', error);
                next(error);
            }
        };
        this.service = service;
    }
}
exports.ReportController = ReportController;
function createeportController(service) {
    return new ReportController(service);
}
exports.default = ReportController;
