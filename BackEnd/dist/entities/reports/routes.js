"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createReportRoutes;
exports.createLARReportRoutesWithController = createLARReportRoutesWithController;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
function createReportRoutes(db) {
    const router = (0, express_1.Router)();
    const model = new model_1.ReportModel(db);
    const service = new service_1.ReportService(model);
    const controller = new controller_1.ReportController(service);
    router.get('/lar-chart', (req, res, next) => {
        controller.getLARChart(req, res, next);
    });
    router.get('/lar-defect', (req, res, next) => {
        controller.getLARDefect(req, res, next);
    });
    router.get('/models', (req, res, next) => {
        controller.getAvailableModels(req, res, next);
    });
    router.get('/fiscal-years', (req, res, next) => {
        controller.getFiscalYears(req, res, next);
    });
    router.get('/work-weeks', (req, res, next) => {
        controller.getWorkWeeks(req, res, next);
    });
    router.get('/seagate-iqa-result', (req, res, next) => {
        controller.getSeagateIQAResult(req, res, next);
    });
    router.get('/oqa-dppm-overall-chart', (req, res, next) => {
        controller.getOQADppmOverallChart(req, res, next);
    });
    router.get('/oqa-dppm-overall-defect', (req, res, next) => {
        controller.getOQADppmOverallDefect(req, res, next);
    });
    router.get('/sgt-iqa-trend-chart', (req, res, next) => {
        controller.getSGTIQATrendChart(req, res, next);
    });
    router.get('/sgt-iqa-trend-defect', (req, res, next) => {
        controller.getSGTIQATrendDefect(req, res, next);
    });
    return router;
}
function createLARReportRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.get('/lar-chart', controller.getLARChart);
    router.get('/lar-defect', controller.getLARDefect);
    router.get('/models', controller.getAvailableModels);
    router.get('/fiscal-years', controller.getFiscalYears);
    router.get('/work-weeks', controller.getWorkWeeks);
    router.get('/seagate-iqa-result', controller.getSeagateIQAResult);
    router.get('/oqa-dppm-overall-chart', controller.getOQADppmOverallChart);
    router.get('/oqa-dppm-overall-defect', controller.getOQADppmOverallDefect);
    router.get('/sgt-iqa-trend-chart', controller.getSGTIQATrendChart);
    router.get('/sgt-iqa-trend-defect', controller.getSGTIQATrendDefect);
    return router;
}
