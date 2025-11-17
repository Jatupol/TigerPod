"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineFviRoutes = void 0;
exports.createLineFviRoutesWithController = createLineFviRoutesWithController;
exports.default = default_1;
exports.createLineFviRoutes = createLineFviRoutes;
exports.createLineFviRoutesGeneric = createLineFviRoutesGeneric;
exports.createLineFviRoutesWithCustomRoles = createLineFviRoutesWithCustomRoles;
exports.createLineFviEntity = createLineFviEntity;
const express_1 = require("express");
const generic_routes_1 = require("../../generic/entities/varchar-code-entity/generic-routes");
const types_1 = require("./types");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
const auth_1 = require("../../middleware/auth");
function createLineFviRoutesWithController(controller) {
    const lineFviRoutes = new LineFviRoutes(controller);
    return lineFviRoutes.getRouter();
}
function default_1(db) {
    const lineFviModel = new model_1.LineFviModel(db);
    const lineFviService = new service_1.LineFviService(lineFviModel);
    const lineFviController = new controller_1.LineFviController(lineFviService);
    return createLineFviRoutesWithController(lineFviController);
}
class LineFviRoutes {
    constructor(controller) {
        this.validateSearchPattern = (req, res, next) => {
            const { pattern } = req.params;
            if (!pattern || pattern.length < 2 || pattern.length > 50) {
                res.status(400).json({
                    success: false,
                    message: 'Search pattern must be between 2 and 50 characters'
                });
                return;
            }
            next();
        };
        this.router = (0, express_1.Router)();
        this.controller = controller;
        this.setupRoutes();
    }
    getRouter() {
        return this.router;
    }
    setupRoutes() {
        this.setupGenericRoutes();
        this.setupLineFviSpecificRoutes();
    }
    setupGenericRoutes() {
        const genericRouter = (0, generic_routes_1.createVarcharCodeRoutes)(this.controller, types_1.LineFviEntityConfig);
        this.router.use('/', genericRouter);
    }
    setupLineFviSpecificRoutes() {
        this.router.use(auth_1.requestTracking);
        this.router.get('/statistics', auth_1.requireAuthentication, auth_1.requireManager, (req, res, next) => {
            this.controller.getStatistics(req, res, next);
        });
        this.router.post('/check-code', auth_1.requireAuthentication, auth_1.requireUser, (req, res, next) => {
            this.controller.checkCodeAvailability(req, res, next);
        });
        this.router.get('/search/name/:pattern', auth_1.requireAuthentication, auth_1.requireUser, this.validateSearchPattern, (req, res, next) => {
            this.controller.search(req, res, next);
        });
        this.router.get('/:code/operational-status', auth_1.requireAuthentication, auth_1.requireUser, auth_1.validateVarcharCode, (req, res, next) => {
            this.controller.checkOperationalStatus(req, res, next);
        });
    }
}
exports.LineFviRoutes = LineFviRoutes;
function createLineFviRoutes(db) {
    const lineFviModel = new model_1.LineFviModel(db);
    const lineFviService = new service_1.LineFviService(lineFviModel);
    const lineFviController = new controller_1.LineFviController(lineFviService);
    return createLineFviRoutesWithController(lineFviController);
}
function createLineFviRoutesGeneric(controller) {
    return (0, generic_routes_1.createVarcharCodeRoutes)(controller, types_1.LineFviEntityConfig);
}
function createLineFviRoutesWithCustomRoles(controller, roleConfig) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requestTracking);
    const roles = {
        create: roleConfig?.create || auth_1.requireManager,
        read: roleConfig?.read || auth_1.requireUser,
        update: roleConfig?.update || auth_1.requireManager,
        delete: roleConfig?.delete || auth_1.requireAdmin,
        statistics: roleConfig?.statistics || auth_1.requireManager,
        maintenance: roleConfig?.maintenance || auth_1.requireManager,
        validation: roleConfig?.validation || auth_1.requireManager
    };
    router.post('/', auth_1.requireAuthentication, roles.create, (req, res, next) => {
        controller.create(req, res, next);
    });
    router.get('/', auth_1.requireAuthentication, roles.read, (req, res, next) => {
        controller.getAll(req, res, next);
    });
    router.get('/:code', auth_1.requireAuthentication, roles.read, auth_1.validateVarcharCode, (req, res, next) => {
        controller.getByCode(req, res, next);
    });
    router.put('/:code', auth_1.requireAuthentication, roles.update, auth_1.validateVarcharCode, (req, res, next) => {
        controller.update(req, res, next);
    });
    router.delete('/:code', auth_1.requireAuthentication, roles.delete, auth_1.validateVarcharCode, (req, res, next) => {
        controller.delete(req, res, next);
    });
    router.get('/statistics', auth_1.requireAuthentication, roles.statistics, (req, res, next) => {
        controller.getStatistics(req, res, next);
    });
    return router;
}
function createLineFviEntity(db) {
    const model = new model_1.LineFviModel(db);
    const service = new service_1.LineFviService(model);
    const controller = new controller_1.LineFviController(service);
    const routes = new LineFviRoutes(controller);
    return {
        model,
        service,
        controller,
        routes: routes.getRouter()
    };
}
