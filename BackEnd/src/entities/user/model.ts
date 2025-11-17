// server/src/entities/user/model.ts
// User Entity Model - Complete Separation Entity Architecture
// SERIAL ID Pattern Implementation

/**
 * User Entity Model Implementation
 * 
 * Extends GenericSerialIdModel to inherit 90% of database operations while
 * adding user-specific methods for authentication and user management.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends Generic Serial ID Model pattern
 * ✅ No direct cross-entity dependencies
 * ✅ User-specific database operations
 * ✅ Password hashing and authentication queries
 * ✅ Session management integration
 * 
 * Generic Pattern Benefits:
 * ✅ Inherits: findById, findAll, update, delete operations
 * ✅ Inherits: pagination, filtering, sorting functionality
 * ✅ Inherits: standard validation and error handling
 * ✅ Overrides: create (for user-specific fields)
 * ✅ Adds: authentication-specific queries
 */

import { Pool, PoolClient } from 'pg';
import { GenericSerialIdModel } from '../../generic/entities/serial-id-entity/generic-model';
import {
  User,
  UserProfile,
  CreateUserData,
  UpdateUserData,
  UserQueryParams,
  SessionUser,
  UserStats,
  UserRole,
  DEFAULT_USER_CONFIG,
  sanitizeUser
} from './types';
import {
  SerialIdPaginatedResponse,
  SerialIdQueryOptions,
  CreateSerialIdData,
  UpdateSerialIdData
} from '../../generic/entities/serial-id-entity/generic-types';

/**
 * User Entity Model
 * 
 * Database operations layer for user management extending Generic Serial ID pattern.
 * Provides user-specific queries, authentication methods, and password management.
 */
export class UserModel extends GenericSerialIdModel<User> {

  constructor(db: Pool) {
    super(db, DEFAULT_USER_CONFIG);
  }

  // ==================== BASIC CRUD OPERATIONS ====================

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users
        WHERE id = $1
      `;

      const result = await this.db.query(query, [id]);
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error}`);
    }
  }

  // ==================== USER-SPECIFIC DATABASE OPERATIONS ====================

  /**
   * Create new user with user-specific fields
   * Overrides generic create to handle additional user fields
   */
  async createUser(userData: CreateUserData, createdBy: number = 0): Promise<User> {
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

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update user with user-specific fields
   * Extends generic update to handle additional user fields
   */
  async updateUser(id: number, userData: UpdateUserData, updatedBy: number): Promise<User> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
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

      // Always update these fields
      updates.push(`updated_by = $${paramCount++}`);
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(updatedBy);

      // Add ID for WHERE clause
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

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

   // ==================== AUTHENTICATION QUERIES ====================

  /**
   * Find user by username for authentication
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE username = $1 AND is_active = true
      `;
      
      const result = await this.db.query(query, [username]);
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      throw new Error(`Failed to find user by username: ${error}`);
    }
  }

  /**
   * Find user by email for authentication
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM users 
        WHERE email = $1 AND is_active = true
      `;
      
      const result = await this.db.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      throw new Error(`Failed to find user by email: ${error}`);
    }
  }

  /**
   * Check if username exists (for validation)
   */
  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    try {
      let query = 'SELECT 1 FROM users WHERE username = $1';
      const values: any[] = [username];

      if (excludeId) {
        query += ' AND id != $2';
        values.push(excludeId);
      }

      const result = await this.db.query(query, values);
      return result.rows.length > 0;

    } catch (error) {
      throw new Error(`Failed to check username existence: ${error}`);
    }
  }

  /**
   * Check if email exists (for validation)
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      let query = 'SELECT 1 FROM users WHERE email = $1';
      const values: any[] = [email.toLowerCase()];

      if (excludeId) {
        query += ' AND id != $2';
        values.push(excludeId);
      }

      const result = await this.db.query(query, values);
      return result.rows.length > 0;

    } catch (error) {
      throw new Error(`Failed to check email existence: ${error}`);
    }
  }

  // ==================== ENHANCED QUERY METHODS ====================

  /**
   * Find all users with user-specific filtering
   * Extends generic findAll with user-specific filters
   */
  async findAllUsers(options: UserQueryParams = {}): Promise<SerialIdPaginatedResponse<UserProfile>> {
    try {
      // Build dynamic WHERE clause for user-specific filters
      const whereConditions: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      // Generic filters (handled by base class logic)
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

      // User-specific filters
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

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Pagination
      const page = options.page || 1;
      const limit = Math.min(options.limit || DEFAULT_USER_CONFIG.defaultLimit, DEFAULT_USER_CONFIG.maxLimit);
      const offset = (page - 1) * limit;

      // Sorting
      const sortBy = options.sortBy || 'name';
      const sortOrder = options.sortOrder || 'ASC';
      
      // Validate sort field to prevent SQL injection
      const allowedSortFields = ['id', 'username', 'email', 'name', 'role', 'position', 'is_active', 'created_at', 'updated_at'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';

      // Main query for users (excluding password_hash)
      const dataQuery = `
        SELECT id, username, email, name, role, position, 
               is_active, created_by, updated_by, created_at, updated_at
        FROM users 
        ${whereClause}
        ORDER BY ${safeSortBy} ${sortOrder}
        LIMIT $${paramCount++} OFFSET $${paramCount++}
      `;
      values.push(limit, offset);

      // Count query for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM users 
        ${whereClause}
      `;
      const countValues = values.slice(0, -2); // Remove limit and offset for count

      // Execute both queries
      const [dataResult, countResult] = await Promise.all([
        this.db.query(dataQuery, values),
        this.db.query(countQuery, countValues)
      ]);

      const users = dataResult.rows as UserProfile[];
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

    } catch (error) {
      throw new Error(`Failed to find users: ${error}`);
    }
  }

  // ==================== USER STATISTICS ====================

  /**
   * Get user statistics for dashboard/reports
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const queries = [
        // Total users
        'SELECT COUNT(*) as total FROM users',
        
        // Active users
        'SELECT COUNT(*) as active FROM users WHERE is_active = true',
        
        // Inactive users
        'SELECT COUNT(*) as inactive FROM users WHERE is_active = false',
        
        // Role distribution
        `SELECT role, COUNT(*) as count 
         FROM users 
         GROUP BY role`,
        
        // Recent registrations (last 30 days)
        `SELECT COUNT(*) as recent 
         FROM users 
         WHERE created_at >= NOW() - INTERVAL '30 days'`,
        
        // Position distribution
        `SELECT position, COUNT(*) as count 
         FROM users 
         WHERE position != '' 
         GROUP BY position`
      ];

      const results = await Promise.all(
        queries.map(query => this.db.query(query))
      );

      const [totalResult, activeResult, inactiveResult, roleResult, recentResult, positionResult] = results;

      // Process role distribution
      const roleDistribution = { admin: 0, manager: 0, user: 0, viewer: 0 };
      roleResult.rows.forEach(row => {
        if (row.role in roleDistribution) {
          roleDistribution[row.role as keyof typeof roleDistribution] = parseInt(row.count);
        }
      });

      // Process position distribution
      const positionDistribution: Record<string, number> = {};
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

    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error}`);
    }
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Get session data for a user
   */
  async getSessionData(userId: number): Promise<SessionUser | null> {
    try {
      const query = `
        SELECT id, username, email, name, role, position, is_active
        FROM users 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await this.db.query(query, [userId]);
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      throw new Error(`Failed to get session data: ${error}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get users by role (for authorization checks)
   */
  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
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

    } catch (error) {
      throw new Error(`Failed to get users by role: ${error}`);
    }
  }

  /**
   * User Check-In
   */
  async checkin(username: string): Promise<boolean> {
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
      const values: any[] = [username];

      const result = await this.db.query(query, values);
      // Check if any rows were updated (rowCount will be > 0 if user exists and was updated)
      return (result.rowCount ?? 0) > 0;

    } catch (error) {
      throw new Error(`Failed to check In: ${error}`);
    }
  }


  /**
   * Get active user count  
   */
  async getUserCount(status: string): Promise<number> {
    try {

      let query = 'SELECT COUNT(*) as count FROM users';
      const values: any[] = [];

      if (status === 'active') {
        query += ' WHERE is_active = true';
      } else if (status === 'inactive') {
        query += ' WHERE is_active = false';
      }
      
      const result = await this.db.query(query, values);

      return parseInt(result.rows[0].count, 10);

    } catch (error) {
      throw new Error(`Failed to get user count: ${error}`);
    }
  }

}

/**
 * Factory function to create a user model instance
 * 
 * Factory pattern for dependency injection.
 */
export function createUserModel(db: Pool): UserModel {
  return new UserModel(db);
}