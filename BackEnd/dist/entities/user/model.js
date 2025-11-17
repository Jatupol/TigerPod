"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
exports.createUserModel = createUserModel;
const generic_model_1 = require("../../generic/entities/serial-id-entity/generic-model");
const types_1 = require("./types");
class UserModel extends generic_model_1.GenericSerialIdModel {
    constructor(db) {
        super(db, types_1.DEFAULT_USER_CONFIG);
    }
    async findById(id) {
        try {
            const query = `
        SELECT * FROM users
        WHERE id = $1
      `;
            const result = await this.db.query(query, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by ID: ${error}`);
        }
    }
    async createUser(userData, createdBy = 0) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const query = `
        INSERT INTO users (
          username, email, password_hash, name, role, position,
          is_active, work_shift, team, linevi, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
        RETURNING *
      `;
            const values = [
                userData.username,
                userData.email,
                userData.password_hash,
                userData.name,
                userData.role,
                userData.position,
                userData.is_active,
                userData.work_shift || null,
                userData.team || null,
                userData.linevi || null,
                createdBy
            ];
            const result = await client.query(query, values);
            await client.query('COMMIT');
            return result.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async updateUser(id, userData, updatedBy) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            const updates = [];
            const values = [];
            let paramCount = 1;
            if (userData.username !== undefined) {
                updates.push(`username = $${paramCount++}`);
                values.push(userData.username);
            }
            if (userData.email !== undefined) {
                updates.push(`email = $${paramCount++}`);
                values.push(userData.email);
            }
            if (userData.password_hash !== undefined) {
                updates.push(`password_hash = $${paramCount++}`);
                values.push(userData.password_hash);
            }
            if (userData.name !== undefined) {
                updates.push(`name = $${paramCount++}`);
                values.push(userData.name);
            }
            if (userData.role !== undefined) {
                updates.push(`role = $${paramCount++}`);
                values.push(userData.role);
            }
            if (userData.position !== undefined) {
                updates.push(`position = $${paramCount++}`);
                values.push(userData.position);
            }
            if (userData.is_active !== undefined) {
                updates.push(`is_active = $${paramCount++}`);
                values.push(userData.is_active);
            }
            if (userData.work_shift !== undefined) {
                updates.push(`work_shift = $${paramCount++}`);
                values.push(userData.work_shift);
            }
            if (userData.team !== undefined) {
                updates.push(`team = $${paramCount++}`);
                values.push(userData.team);
            }
            if (userData.linevi !== undefined) {
                updates.push(`linevi = $${paramCount++}`);
                values.push(userData.linevi);
            }
            updates.push(`updated_by = $${paramCount++}`);
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(updatedBy);
            values.push(id);
            const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                throw new Error('User not found');
            }
            await client.query('COMMIT');
            return result.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async findByUsername(username) {
        try {
            const query = `
        SELECT * FROM users 
        WHERE username = $1 AND is_active = true
      `;
            const result = await this.db.query(query, [username]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by username: ${error}`);
        }
    }
    async findByEmail(email) {
        try {
            const query = `
        SELECT * FROM users 
        WHERE email = $1 AND is_active = true
      `;
            const result = await this.db.query(query, [email.toLowerCase()]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to find user by email: ${error}`);
        }
    }
    async usernameExists(username, excludeId) {
        try {
            let query = 'SELECT 1 FROM users WHERE username = $1';
            const values = [username];
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            const result = await this.db.query(query, values);
            return result.rows.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to check username existence: ${error}`);
        }
    }
    async emailExists(email, excludeId) {
        try {
            let query = 'SELECT 1 FROM users WHERE email = $1';
            const values = [email.toLowerCase()];
            if (excludeId) {
                query += ' AND id != $2';
                values.push(excludeId);
            }
            const result = await this.db.query(query, values);
            return result.rows.length > 0;
        }
        catch (error) {
            throw new Error(`Failed to check email existence: ${error}`);
        }
    }
    async findAllUsers(options = {}) {
        try {
            const whereConditions = [];
            const values = [];
            let paramCount = 1;
            if (options.isActive !== undefined) {
                whereConditions.push(`is_active = $${paramCount++}`);
                values.push(options.isActive);
            }
            if (options.search) {
                whereConditions.push(`(
          username ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          name ILIKE $${paramCount} OR 
          position ILIKE $${paramCount}
        )`);
                values.push(`%${options.search}%`);
                paramCount++;
            }
            if (options.role) {
                whereConditions.push(`role = $${paramCount++}`);
                values.push(options.role);
            }
            if (options.position) {
                whereConditions.push(`position ILIKE $${paramCount++}`);
                values.push(`%${options.position}%`);
            }
            if (options.username) {
                whereConditions.push(`username ILIKE $${paramCount++}`);
                values.push(`%${options.username}%`);
            }
            if (options.email) {
                whereConditions.push(`email ILIKE $${paramCount++}`);
                values.push(`%${options.email}%`);
            }
            const whereClause = whereConditions.length > 0
                ? `WHERE ${whereConditions.join(' AND ')}`
                : '';
            const page = options.page || 1;
            const limit = Math.min(options.limit || types_1.DEFAULT_USER_CONFIG.defaultLimit, types_1.DEFAULT_USER_CONFIG.maxLimit);
            const offset = (page - 1) * limit;
            const sortBy = options.sortBy || 'name';
            const sortOrder = options.sortOrder || 'ASC';
            const allowedSortFields = ['id', 'username', 'email', 'name', 'role', 'position', 'is_active', 'created_at', 'updated_at'];
            const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
            const dataQuery = `
        SELECT id, username, email, name, role, position, 
               is_active, created_by, updated_by, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY ${safeSortBy} ${sortOrder}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;
            values.push(limit, offset);
            const countQuery = `
        SELECT COUNT(*) as total 
        FROM users 
        ${whereClause}
      `;
            const countValues = values.slice(0, -2);
            const [dataResult, countResult] = await Promise.all([
                this.db.query(dataQuery, values),
                this.db.query(countQuery, countValues)
            ]);
            const users = dataResult.rows;
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            return {
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to find users: ${error}`);
        }
    }
    async getUserStats() {
        try {
            const queries = [
                'SELECT COUNT(*) as total FROM users',
                'SELECT COUNT(*) as active FROM users WHERE is_active = true',
                'SELECT COUNT(*) as inactive FROM users WHERE is_active = false',
                `SELECT role, COUNT(*) as count 
         FROM users 
         GROUP BY role`,
                `SELECT COUNT(*) as recent 
         FROM users 
         WHERE created_at >= NOW() - INTERVAL '30 days'`,
                `SELECT position, COUNT(*) as count 
         FROM users 
         WHERE position != '' 
         GROUP BY position`
            ];
            const results = await Promise.all(queries.map(query => this.db.query(query)));
            const [totalResult, activeResult, inactiveResult, roleResult, recentResult, positionResult] = results;
            const roleDistribution = { admin: 0, manager: 0, user: 0, viewer: 0 };
            roleResult.rows.forEach(row => {
                if (row.role in roleDistribution) {
                    roleDistribution[row.role] = parseInt(row.count);
                }
            });
            const positionDistribution = {};
            positionResult.rows.forEach(row => {
                positionDistribution[row.position] = parseInt(row.count);
            });
            return {
                total_users: parseInt(totalResult.rows[0].total),
                active_users: parseInt(activeResult.rows[0].active),
                inactive_users: parseInt(inactiveResult.rows[0].inactive),
                role_distribution: roleDistribution,
                recent_registrations: parseInt(recentResult.rows[0].recent),
                position_distribution: positionDistribution
            };
        }
        catch (error) {
            throw new Error(`Failed to get user statistics: ${error}`);
        }
    }
    async getSessionData(userId) {
        try {
            const query = `
        SELECT id, username, email, name, role, position, is_active
        FROM users 
        WHERE id = $1 AND is_active = true
      `;
            const result = await this.db.query(query, [userId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        }
        catch (error) {
            throw new Error(`Failed to get session data: ${error}`);
        }
    }
    async getUsersByRole(role) {
        try {
            const query = `
        SELECT id, username, email, name, role, position, 
               is_active, created_by, updated_by, created_at, updated_at
        FROM users 
        WHERE role = $1 AND is_active = true
        ORDER BY name ASC
      `;
            const result = await this.db.query(query, [role]);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get users by role: ${error}`);
        }
    }
    async checkin(username) {
        try {
            let query = `
        UPDATE users AS U
        SET
          checkin = sub.created_on::timestamp with time zone,
          work_shift = sub.work_shift_id,
          linevi = sub.line_no_id,
          time_start_work = sub.time_start_work::time without time zone,
          time_off_work = sub.time_off_work::time without time zone
        FROM (
          SELECT created_on, work_shift_id, line_no_id, time_start_work, time_off_work
          FROM inf_checkin
          WHERE username = $1
          ORDER BY created_on DESC
          LIMIT 1
        ) AS sub
        WHERE U.username = $1
       `;
            const values = [username];
            const result = await this.db.query(query, values);
            return (result.rowCount ?? 0) > 0;
        }
        catch (error) {
            throw new Error(`Failed to check In: ${error}`);
        }
    }
    async getUserCount(status) {
        try {
            let query = 'SELECT COUNT(*) as count FROM users';
            const values = [];
            if (status === 'active') {
                query += ' WHERE is_active = true';
            }
            else if (status === 'inactive') {
                query += ' WHERE is_active = false';
            }
            const result = await this.db.query(query, values);
            return parseInt(result.rows[0].count, 10);
        }
        catch (error) {
            throw new Error(`Failed to get user count: ${error}`);
        }
    }
}
exports.UserModel = UserModel;
function createUserModel(db) {
    return new UserModel(db);
}
