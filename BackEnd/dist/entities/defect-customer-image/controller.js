"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectImageController = void 0;
exports.createDefectImageController = createDefectImageController;
class DefectImageController {
    constructor(service) {
        this.create = async (req, res, next) => {
            try {
                const { defect_id } = req.body;
                const userId = this.extractUserId(req);
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        message: 'No image file provided'
                    });
                    return;
                }
                const result = await this.service.create({
                    defect_id: parseInt(defect_id),
                    imge_data: req.file.buffer
                }, userId);
                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    data: {
                        id: result.data?.id,
                        defect_id: result.data?.defect_id
                    },
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.create:', error);
                next(error);
            }
        };
        this.bulkCreate = async (req, res, next) => {
            try {
                const { defect_id } = req.body;
                const userId = this.extractUserId(req);
                if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'No image files provided'
                    });
                    return;
                }
                const imageBuffers = req.files.map(file => file.buffer);
                const result = await this.service.bulkCreate(parseInt(defect_id), imageBuffers, userId);
                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    data: result.data?.map(img => ({
                        id: img.id,
                        defect_id: img.defect_id
                    })),
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.bulkCreate:', error);
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = this.extractUserId(req);
                const result = await this.service.getById(id, userId);
                if (!result.success) {
                    res.status(404).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.set('Content-Type', 'image/jpeg');
                res.send(result.data?.imge_data);
            }
            catch (error) {
                console.error('Error in DefectImageController.getById:', error);
                next(error);
            }
        };
        this.getByDefectId = async (req, res, next) => {
            try {
                const defectId = parseInt(req.params.defectId);
                const userId = this.extractUserId(req);
                const result = await this.service.getByDefectId(defectId, userId);
                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: result.data?.map(img => ({
                        id: img.id,
                        defect_id: img.defect_id,
                        image_url: `/api/defect-customer-image/${img.id}`
                    })),
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.getByDefectId:', error);
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = this.extractUserId(req);
                const result = await this.service.delete(id, userId);
                if (!result.success) {
                    res.status(404).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.delete:', error);
                next(error);
            }
        };
        this.deleteByDefectId = async (req, res, next) => {
            try {
                const defectId = parseInt(req.params.defectId);
                const userId = this.extractUserId(req);
                const result = await this.service.deleteByDefectId(defectId, userId);
                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        message: result.error
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: { deletedCount: result.data },
                    message: result.message
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.deleteByDefectId:', error);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
            try {
                const result = await this.service.healthCheck();
                res.status(result.healthy ? 200 : 503).json({
                    success: result.healthy,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error in DefectImageController.healthCheck:', error);
                next(error);
            }
        };
        this.service = service;
    }
    extractUserId(req) {
        return req.session?.user?.id;
    }
}
exports.DefectImageController = DefectImageController;
function createDefectImageController(service) {
    return new DefectImageController(service);
}
