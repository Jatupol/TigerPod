"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineFviController = void 0;
exports.createLineFviController = createLineFviController;
exports.createLineFviControllerGeneric = createLineFviControllerGeneric;
const generic_controller_1 = require("../../generic/entities/varchar-code-entity/generic-controller");
const types_1 = require("./types");
class LineFviController extends generic_controller_1.GenericVarcharCodeController {
    constructor(service) {
        super(service, types_1.LineFviEntityConfig);
        this.checkCodeAvailability = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { code } = req.body;
                if (!code) {
                    res.status(400).json({
                        success: false,
                        error: 'Code is required'
                    });
                    return;
                }
                const result = await this.service.checkCodeAvailability(code, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Code availability checked successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error || 'Failed to check code availability'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.checkOperationalStatus = async (req, res, next) => {
            try {
                const code = req.params.code;
                const result = await this.service.isLineOperational(code);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Operational status checked successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error || 'Failed to check operational status'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.service = service;
    }
}
exports.LineFviController = LineFviController;
function createLineFviController(service) {
    return new LineFviController(service);
}
function createLineFviControllerGeneric(service) {
    return (0, generic_controller_1.createGenericVarcharCodeController)(service, types_1.LineFviEntityConfig);
}
exports.default = LineFviController;
