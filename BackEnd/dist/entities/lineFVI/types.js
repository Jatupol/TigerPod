"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineFviEntityMetadata = exports.LineFviEntityConfig = exports.LineFviConstants = void 0;
exports.LineFviConstants = {
    CODE_MAX_LENGTH: 5,
    CODE_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    NAME_MIN_LENGTH: 1,
    DESCRIPTION_MAX_LENGTH: 500,
    DEFAULT_IS_ACTIVE: true,
    DEFAULT_CREATED_BY: 0,
    DEFAULT_UPDATED_BY: 0,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    CODE_PATTERN: /^[A-Z0-9]+$/,
    ERROR_CODES: {
        DUPLICATE_CODE: 'LINEFVI_DUPLICATE_CODE',
        DUPLICATE_NAME: 'LINEFVI_DUPLICATE_NAME',
        INVALID_CODE: 'LINEFVI_INVALID_CODE',
        INVALID_NAME: 'LINEFVI_INVALID_NAME',
        NOT_FOUND: 'LINEFVI_NOT_FOUND',
        INACTIVE: 'LINEFVI_INACTIVE',
        CONSTRAINT_VIOLATION: 'LINEFVI_CONSTRAINT_VIOLATION'
    }
};
exports.LineFviEntityConfig = {
    entityName: 'line-fvi',
    tableName: 'line_fvi',
    apiPath: '/api/line-fvi',
    codeLength: 5,
    searchableFields: ['code', 'name'],
    defaultLimit: 20,
    maxLimit: 100
};
exports.LineFviEntityMetadata = {
    ...exports.LineFviEntityConfig,
    patternType: 'VARCHAR_CODE',
    primaryKey: 'code',
    primaryKeyType: 'string',
    fields: {
        code: { type: 'string', length: 5, required: true, unique: true },
        name: { type: 'string', length: 100, required: true, unique: true },
        is_active: { type: 'boolean', default: true },
        created_by: { type: 'number', default: 0 },
        updated_by: { type: 'number', default: 0 },
        created_at: { type: 'timestamp', auto: true },
        updated_at: { type: 'timestamp', auto: true }
    },
    routes: {
        list: 'GET /api/line-fvi',
        create: 'POST /api/line-fvi',
        get: 'GET /api/line-fvi/:code',
        update: 'PUT /api/line-fvi/:code',
        delete: 'DELETE /api/line-fvi/:code',
        changeStatus: 'PATCH /api/line-fvi/:code/status'
    }
};
