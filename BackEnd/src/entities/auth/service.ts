// server/src/entities/auth/service.ts
/**
 * Authentication Entity Service - Core Middleware Compatible
 * Manufacturing Quality Control System
 * 
 * Complete Separation Entity Architecture:
 * ✅ Handles authentication business logic
 * ✅ Compatible with core middleware session handling
 * ✅ Reuses auth model for database operations
 * ✅ Focused on auth-specific operations only
 */

import { AuthModel } from './model';
import { 
  LoginRequest, 
  ChangePasswordRequest, 
  AuthResult, 
  AuthStatusResponse,
  SessionUser, 
  createSessionUser,
  validateLoginRequest,
  validatePasswordChangeRequest
} from './types';

/**
 * Authentication Service Class
 * Handles authentication business logic and validation
 */
export class AuthService {
  private authModel: AuthModel;

  constructor(authModel: AuthModel) {
    this.authModel = authModel;
  }

  // ==================== AUTHENTICATION OPERATIONS ====================

  /**
   * Authenticate user with username/email and password
   */
  async login(loginData: LoginRequest): Promise<AuthResult> {
    try {
      // Validate input data
      if (!validateLoginRequest(loginData)) {
        return {
          success: false,
          message: 'Invalid login data. Username and password are required.',
          error: 'VALIDATION_ERROR'
        };
      }

      const { username, password } = loginData;

      // Try to find user by username first, then by email
      let user = await this.authModel.findUserByUsername(username);
      if (!user && username.includes('@')) {
        user = await this.authModel.findUserByEmail(username);
      }

      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password',
          error: 'INVALID_CREDENTIALS'
        };
      }

      // Check if user account is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is inactive. Contact administrator.',
          error: 'INACTIVE_ACCOUNT'
        };
      }

      // Verify password
      const isPasswordValid = await this.authModel.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password',
          error: 'INVALID_CREDENTIALS'
        };
      }

      // Update last login time (async, don't wait)
      this.authModel.updateLastLogin(user.id).catch(error => {
        console.error('Failed to update last login:', error);
      });

      // Get current shift data from inf_checkin and update user table (async, don't wait)
      this.updateUserShiftData(user.id, user.username).catch(error => {
        console.error('Failed to update shift data:', error);
      });

      // Create session user data
      const sessionUser = createSessionUser(user);

      return {
        success: true,
        message: 'Login successful',
        user: sessionUser
      };

    } catch (error: any) {
      console.error('Login service error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  /**
   * Initialize user session (called after successful login)
   */
  initializeSession(session: any, user: SessionUser, rememberMe: boolean = false): void {
    try {
      // Set session data compatible with core middleware
      session.user = user;
      session.userId = user.id;
      session.username = user.username;
      session.role = user.role;
      session.loginTime = new Date();
      session.lastActivity = new Date();

      // Set session expiration based on rememberMe
      if (rememberMe) {
        // Remember me: 30 days
        session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        session.expiresAt = new Date(Date.now() + session.cookie.maxAge);
      } else {
        // Regular session: 24 hours
        session.cookie.maxAge = 24 * 60 * 60 * 1000;
        session.expiresAt = new Date(Date.now() + session.cookie.maxAge);
      }

      console.log(`Session initialized for user ${user.username} (ID: ${user.id})`);

    } catch (error: any) {
      console.error('Session initialization error:', error);
      throw new Error('Failed to initialize session');
    }
  }

  /**
   * Destroy user session (logout)
   */
  destroySession(session: any): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!session) {
          resolve(true);
          return;
        }

        const username = session.username || 'unknown';
        
        session.destroy((error: any) => {
          if (error) {
            console.error('Session destruction error:', error);
            resolve(false);
          } else {
            console.log(`Session destroyed for user ${username}`);
            resolve(true);
          }
        });

      } catch (error: any) {
        console.error('Session destruction error:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get authentication status for current session
   */
  async getAuthStatus(session: any): Promise<AuthStatusResponse> {
    try {
      // Check if session has user data
      if (!session || !session.user) {
        return {
          authenticated: false
        };
      }

      // Validate session user data
      const sessionUser = session.user as SessionUser;
      if (!sessionUser.id || !sessionUser.username) {
        return {
          authenticated: false
        };
      }

      // Optionally verify user still exists and is active
      const currentUser = await this.authModel.findUserById(sessionUser.id);
      if (!currentUser || !currentUser.is_active) {
        return {
          authenticated: false
        };
      }

      return {
        authenticated: true,
        user: sessionUser,
        sessionExpiry: session.expiresAt ? new Date(session.expiresAt) : undefined,
        permissions: this.getUserPermissions(sessionUser.role)
      };

    } catch (error: any) {
      console.error('Get auth status error:', error);
      return {
        authenticated: false
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, passwordData: ChangePasswordRequest): Promise<AuthResult> {
    try {
      // Validate input data
      if (!validatePasswordChangeRequest(passwordData)) {
        return {
          success: false,
          message: 'Invalid password data. New password is required.',
          error: 'VALIDATION_ERROR'
        };
      }

      const { currentPassword, newPassword } = passwordData;

      // Get current user
      const user = await this.authModel.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Verify current password if provided
      if (currentPassword) {
        const isCurrentPasswordValid = await this.authModel.verifyPassword(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: 'Current password is incorrect',
            error: 'INVALID_CURRENT_PASSWORD'
          };
        }
      }

      // Check if new password is different from current
      const isSamePassword = await this.authModel.verifyPassword(newPassword, user.password_hash);
      if (isSamePassword) {
        return {
          success: false,
          message: 'New password must be different from current password',
          error: 'SAME_PASSWORD'
        };
      }

      // Update password
      const passwordUpdated = await this.authModel.updatePassword(userId, newPassword);
      if (!passwordUpdated) {
        return {
          success: false,
          message: 'Failed to update password',
          error: 'UPDATE_FAILED'
        };
      }

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error: any) {
      console.error('Change password service error:', error);
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get user permissions based on role (public method)
   */
  getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'system_admin'],
      manager: ['read', 'write', 'delete', 'manage_team'],
      user: ['read', 'write']
    };

    return permissions[role] || permissions.user;
  }

  /**
   * Validate session data format
   */
  validateSessionData(session: any): boolean {
    return !!(
      session &&
      session.user &&
      session.user.id &&
      session.user.username &&
      session.user.role
    );
  }

  /**
   * Check if user session needs refresh
   */
  needsSessionRefresh(session: any): boolean {
    if (!session || !session.expiresAt) {
      return true;
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh if less than 1 hour remaining
    return timeUntilExpiry < (60 * 60 * 1000);
  }

  /**
   * Get authentication statistics (for admin monitoring)
   */
  async getAuthStats(): Promise<{ totalUsers: number; activeUsers: number }> {
    try {
      return await this.authModel.getAuthStats();
    } catch (error: any) {
      console.error('Get auth stats error:', error);
      return { totalUsers: 0, activeUsers: 0 };
    }
  }

  // ==================== SHIFT DATA OPERATIONS ====================

  /**
   * Update user shift data from inf_checkin table during login
   */
  private async updateUserShiftData(userId: number, username: string): Promise<void> {
    try {
      console.log(`🔄 Updating shift data for user: ${username} (ID: ${userId})`);

      // Get current shift data from inf_checkin table
      const shiftData = await this.authModel.getCurrentShiftData(username);

      if (shiftData) {
        // Update user table with shift data
        await this.authModel.updateUserShiftData(userId, shiftData);
        console.log(`✅ Shift data updated for user: ${username}`);
        console.log(`   Work Shift: ${shiftData.work_shift_id || 'N/A'}`);
        console.log(`   Team: ${shiftData.team || 'N/A'}`);
        console.log(`   Line VI: ${shiftData.line_no_id || 'N/A'}`);
        console.log(`   Check-in: ${shiftData.checkin || 'N/A'}`);
        console.log(`   Work Hours: ${shiftData.time_start_work || 'N/A'} - ${shiftData.time_off_work || 'N/A'}`);
      } else {
        console.log(`ℹ️  No active shift data found for user: ${username}`);
        // Clear shift data in user table if no active shift found
        await this.authModel.updateUserShiftData(userId, {
          work_shift_id: null,
          checkin: null,
          time_start_work: null,
          time_off_work: null,
          team: null,
          line_no_id: null
        });
      }

    } catch (error: any) {
      console.error('Update user shift data error:', error);
      // Don't throw - shift data update should not prevent login
    }
  }
}

/*
=== AUTH SERVICE FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Focused on authentication business logic only
✅ Uses AuthModel for all database operations
✅ Compatible with core middleware session handling
✅ No direct database access or duplicate logic

AUTHENTICATION OPERATIONS:
✅ Username/email login with password verification
✅ Session initialization with core middleware compatibility
✅ Session destruction and cleanup
✅ Authentication status checking

SESSION MANAGEMENT:
✅ Compatible with core middleware session structure
✅ Proper session data initialization
✅ Session expiration handling (remember me)
✅ Session validation and refresh detection

PASSWORD MANAGEMENT:
✅ Secure password verification
✅ Password change with current password validation
✅ Prevention of reusing current password
✅ Proper error handling for all scenarios

SECURITY FEATURES:
✅ Account status validation (active users only)
✅ Input validation for all operations
✅ Proper error messages without information leakage
✅ Role-based permission system

COMPATIBILITY:
✅ Works seamlessly with core middleware
✅ Uses SessionUser type for consistency
✅ Proper session structure for core validation
✅ Standard API response patterns

This Auth service provides complete authentication business logic
while maintaining compatibility with the simplified core middleware
and following the Complete Separation Entity Architecture.
*/