// server/src/entities/auth/controller.ts
/**
 
 * Manufacturing Quality Control System
 * 
 
 */

import { Request, Response } from 'express';
import { AuthService } from './service';
import { authMiddleware } from '../../middleware/auth';
import type { CompatibleQCRequest } from '../../middleware/auth';
import { 
  LoginRequest, 
  ChangePasswordRequest, 
  validateLoginRequest, 
  validatePasswordChangeRequest 
} from './types';

/**
 * Authentication Controller Class
 * Handles all authentication-related HTTP endpoints
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * POST /api/auth/login
   * Authenticate user and create session
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 Login attempt received');

      // Validate request body
      if (!validateLoginRequest(req.body)) {
        res.status(400).json(authMiddleware.formatError(
          'Invalid login data. Username and password are required.',
          'VALIDATION_ERROR',
          400
        ));
        return;
      }

      const loginData: LoginRequest = req.body;
      const clientIP = this.getClientIP(req);

      // Attempt authentication
      const result = await this.authService.login(loginData);

      if (result.success && result.user) {
        // Initialize session with user data
        this.authService.initializeSession(
          req.session,
          result.user,
          loginData.rememberMe || false
        );

        // DEBUG: Log session details
        console.log('✅ Session initialized:', {
          sessionID: req.session.id,
          hasUser: !!req.session.user,
          username: req.session.user?.username,
          cookieDomain: req.session.cookie.domain,
          cookieSecure: req.session.cookie.secure,
          cookieSameSite: req.session.cookie.sameSite
        });

        // Log successful login
        this.logAuthAttempt(loginData.username, true, clientIP);

        // Return success response
        res.json(authMiddleware.formatResponse(
          true,
          {
            user: result.user,
            sessionInfo: {
              rememberMe: loginData.rememberMe || false,
              sessionId: req.session.id
            }
          },
          result.message || 'Login successful'
        ));

      } else {
        // Log failed login
        this.logAuthAttempt(loginData.username, false, clientIP, result.error);

        // Return error response
        res.status(401).json(authMiddleware.formatError(
          result.message || 'Login failed',
          result.error || 'LOGIN_FAILED',
          401
        ));
      }

    } catch (error) {
      console.error('Login controller error:', error);
      
      const attemptedUsername = this.extractUsernameForLogging(req.body);
      const clientIP = this.getClientIP(req);
      this.logAuthAttempt(attemptedUsername, false, clientIP, 'SYSTEM_ERROR');

      res.status(500).json(authMiddleware.formatError(
        'Login failed. Please try again.',
        'INTERNAL_ERROR',
        500
      ));
    }
  }

  /**
   * GET /api/auth/status
   * Check authentication status  
   * 
   * Returns authentication state for current session
   */
  async status(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 Auth status check requested');

      // FIXED: Cast to CompatibleQCRequest to access user
      const qcReq = req as CompatibleQCRequest;

      // DEBUG: Log incoming cookies and session
      console.log('🍪 Cookies received:', req.headers.cookie);
      console.log('🔑 Session ID:', req.session?.id);
      console.log('👤 Session user:', req.session?.user?.username);

      // Get comprehensive auth status from service
      const authStatus = await this.authService.getAuthStatus(req.session);

      // FIXED: Enhanced logging for debugging
      console.log('🔍 Session data:', {
        hasSession: !!req.session,
        sessionID: req.session?.id,
        hasSessionUser: !!req.session?.user,
        hasQcUser: !!qcReq.user,
        authStatus: authStatus.authenticated
      });

      // Add additional session information if authenticated
      if (authStatus.authenticated && req.session) {       
        // Check if session needs refresh
        const needsRefresh = this.authService.needsSessionRefresh(req.session);
        (authStatus as any).needsRefresh = needsRefresh;
      }

      // FIXED: Enhanced response with debugging info
      const response = authMiddleware.formatResponse(
        true,
        {
          ...authStatus,
          // Add debugging information (remove in production)
          debug: {
            hasSession: !!req.session,
            hasSessionUser: !!req.session?.user,
            hasQcUser: !!qcReq.user,
            timestamp: new Date().toISOString()
          }
        },
        authStatus.authenticated ? 'User is authenticated' : 'User is not authenticated'
      );

      res.json(response);

    } catch (error) {
      console.error('Auth status error:', error);
      res.status(500).json(authMiddleware.formatError(
        'Unable to check authentication status',
        'STATUS_ERROR',
        500
      ));
    }
  }

  /**
   * POST /api/auth/logout
   * Destroy user session  
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚪 Logout requested');
      
      // FIXED: Cast to CompatibleQCRequest to access user
      const qcReq = req as CompatibleQCRequest;
      const username = qcReq.user?.username || 'unknown';

      // Destroy session
      const destroyed = await this.authService.destroySession(req.session);

      if (destroyed) {
        console.log(`✅ Logout successful for user: ${username}`);
        res.json(authMiddleware.formatResponse(
          true,
          null,
          'Logout successful'
        ));
      } else {
        console.log(`⚠️ Logout had issues for user: ${username}`);
        res.json(authMiddleware.formatResponse(
          true,
          null,
          'Logout completed (with warnings)'
        ));
      }

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(authMiddleware.formatError(
        'Logout failed',
        'LOGOUT_ERROR',
        500
      ));
    }
  }

  /**
   * GET /api/auth/profile
   * Get current user profile  
   */
  async profile(req: Request, res: Response): Promise<void> {
    try {
      // FIXED: Cast to CompatibleQCRequest to access user
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json(authMiddleware.formatError(
          'Authentication required',
          'NO_USER',
          401
        ));
        return;
      }

      // Return user profile data
      res.json(authMiddleware.formatResponse(
        true,
        qcReq.user,
        'User profile retrieved'
      ));

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json(authMiddleware.formatError(
        'Unable to retrieve profile',
        'PROFILE_ERROR',
        500
      ));
    }
  }

  /**
   * PUT /api/auth/password
   * Change user password  
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // FIXED: Cast to CompatibleQCRequest to access user
      const qcReq = req as CompatibleQCRequest;
      
      if (!qcReq.user) {
        res.status(401).json(authMiddleware.formatError(
          'Authentication required',
          'NO_USER',
          401
        ));
        return;
      }

      // Validate request body
      if (!validatePasswordChangeRequest(req.body)) {
        res.status(400).json(authMiddleware.formatError(
          'Invalid password change data',
          'VALIDATION_ERROR',
          400
        ));
        return;
      }

      const changeData: ChangePasswordRequest = req.body;
      const result = await this.authService.changePassword(
        qcReq.user.id,
        changeData
      );

      if (result.success) {
        res.json(authMiddleware.formatResponse(
          true,
          null,
          result.message || 'Password changed successfully'
        ));
      } else {
        res.status(400).json(authMiddleware.formatError(
          result.message || 'Password change failed',
          result.error || 'PASSWORD_CHANGE_FAILED',
          400
        ));
      }

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json(authMiddleware.formatError(
        'Password change failed',
        'PASSWORD_CHANGE_ERROR',
        500
      ));
    }
  }

  /**
   * GET /api/auth/health
   * Health check endpoint with system metrics
   */
  async health(req: Request, res: Response): Promise<void> {
    try {
      const authStats = await this.authService.getAuthStats();
      
      // FIXED: Cast to CompatibleQCRequest to access user
      const qcReq = req as CompatibleQCRequest;
      
      const healthData = {
        status: 'healthy',
        service: 'authentication',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        authStats,
        session: {
          hasSession: !!req.session,
          isAuthenticated: !!qcReq.user,
          user: qcReq.user?.username || null
        }
      };

      res.json(authMiddleware.formatResponse(
        true,
        healthData,
        'Authentication service is healthy'
      ));

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json(authMiddleware.formatError(
        'Health check failed',
        'HEALTH_CHECK_ERROR',
        500
      ));
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Extract client IP address for logging
   */
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? 
      (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) :
      req.socket.remoteAddress;
    
    return ip || 'unknown';
  }

  /**
   * Log authentication attempts for security monitoring
   */
  private logAuthAttempt(username: string, success: boolean, ip: string, error?: string): void {
    const timestamp = new Date().toISOString();
    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    const errorInfo = error ? ` (${error})` : '';
    
    console.log(`🔐 AUTH ${status}: ${username} from ${ip}${errorInfo} - ${timestamp}`);
  }

  /**
   * Safely extract username from request body for logging
   */
  private extractUsernameForLogging(requestBody: any): string {
    if (!requestBody || typeof requestBody !== 'object') {
      return 'unknown';
    }
    
    if ('username' in requestBody && typeof requestBody.username === 'string') {
      return requestBody.username;
    }
    
    return 'unknown';
  }
}
 