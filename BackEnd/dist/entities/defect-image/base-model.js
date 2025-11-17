"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDefectImageModel = void 0;
class BaseDefectImageModel {
    constructor(db, config) {
        this.db = db;
        this.config = config;
    }
    async create(data) {
        const query = `
      INSERT INTO ${this.config.tableName} (defect_id, imge_data)
      VALUES ($1, $2)
      RETURNING id, defect_id, imge_data
    `;
        const result = await this.db.query(query, [
            data.defect_id,
            data.imge_data
        ]);
        return result.rows[0];
    }
    async bulkCreate(defectId, images) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const createdImages = [];
            for (const imageData of images) {
                const query = `
          INSERT INTO ${this.config.tableName} (defect_id, imge_data)
          VALUES ($1, $2)
          RETURNING id, defect_id, imge_data
        `;
                const result = await client.query(query, [defectId, imageData]);
                createdImages.push(result.rows[0]);
            }
            await client.query('COMMIT');
            return createdImages;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getById(id) {
        const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE id = $1
    `;
        const result = await this.db.query(query, [id]);
        return result.rows[0] || null;
    }
    async getByDefectId(defectId) {
        const query = `
      SELECT id, defect_id, imge_data
      FROM ${this.config.tableName}
      WHERE defect_id = $1
      ORDER BY id ASC
    `;
        const result = await this.db.query(query, [defectId]);
        return result.rows;
    }
    async delete(id) {
        const query = `
      DELETE FROM ${this.config.tableName}
      WHERE id = $1
    `;
        const result = await this.db.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async deleteByDefectId(defectId) {
        const query = `
      DELETE FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;
        const result = await this.db.query(query, [defectId]);
        return result.rowCount ?? 0;
    }
    async countByDefectId(defectId) {
        const query = `
      SELECT COUNT(*) as count
      FROM ${this.config.tableName}
      WHERE defect_id = $1
    `;
        const result = await this.db.query(query, [defectId]);
        return parseInt(result.rows[0].count, 10);
    }
}
exports.BaseDefectImageModel = BaseDefectImageModel;
