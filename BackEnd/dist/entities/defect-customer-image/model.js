"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectImageModel = void 0;
exports.createDefectImageModel = createDefectImageModel;
const base_model_1 = require("../defect-image/base-model");
const types_1 = require("./types");
class DefectImageModel extends base_model_1.BaseDefectImageModel {
    constructor(db, config = types_1.DEFAULT_DEFECT_IMAGE_CONFIG) {
        super(db, config);
    }
}
exports.DefectImageModel = DefectImageModel;
function createDefectImageModel(db) {
    return new DefectImageModel(db);
}
