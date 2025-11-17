// client/src/services/inspectionStationService.ts
// Service for Inspection Station Operations
// Generic Inspection Station Page - Unified component for OQA, OBA, and SIV
// Complete Separation Entity Architecture

import { apiBaseUrl } from '../config/api.config';
import type { InspectionRecord } from '../types/inspectiondata';
import type { LotData } from '../types/inf-lotinput';
import type { SIVCreationResponse, SIVCreationResult, StationType } from '../types/inspection-station';

/**
 * Inspection Station Service Class
 * Handles all API operations for inspection station pages (OQA, OBA, SIV)
 */
class InspectionStationService {
  /**
   * Create SIV inspection from OQA inspection
   * BUSINESS RULE: Only OQA station with Pass judgment can create SIV
   *
   * @param inspectionId - The ID of the OQA inspection record
   * @param stationCode - The station code (must be 'OQA')
   * @param judgment - The judgment of the inspection (must be 'Pass')
   * @returns SIVCreationResult with success status and details
   */
  async createSIVFromOQA(
    inspectionId: string,
    stationCode: string,
    judgment: string
  ): Promise<SIVCreationResult> {
    // Validate business rules
    if (stationCode !== 'OQA') {
      return {
        success: false,
        message: `SIV inspection can only be created from OQA station.\n\nCurrent station: ${stationCode}`
      };
    }

    if (judgment !== 'Pass') {
      return {
        success: false,
        message: 'SIV inspection can only be created from OQA inspections with Pass judgment.'
      };
    }

    try {
      console.log('🔧 Creating SIV from inspection:', inspectionId);

      const apiUrl = `${apiBaseUrl('inspectiondata')}/${inspectionId}/create-siv`;
      console.log('📡 API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers.get('content-type'));

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        console.error('❌ Received non-JSON response:', text.substring(0, 200));

        return {
          success: false,
          message: response.status === 401
            ? 'Authentication required. Please log in again.'
            : `Server error (${response.status}). The server returned an unexpected response.`
        };
      }

      const result: SIVCreationResponse = await response.json();
      console.log('📋 API result:', result);

      if (response.ok && result.success) {
        console.log('✅ SIV created:', result.data);
        return {
          success: true,
          message: 'SIV inspection created successfully!',
          inspectionNo: result.data?.inspection_no || 'N/A'
        };
      } else {
        console.error('❌ SIV creation failed:', result);
        return {
          success: false,
          message: result.message || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('❌ Error creating SIV:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  /**
   * Fetch lot details by lot number
   *
   * @param lotno - The lot number to fetch
   * @returns LotData or null if not found
   */
  async getLotDetails(lotno: string): Promise<LotData | null> {
    try {
      console.log('🔍 Fetching lot details for:', lotno);

      const response = await fetch(`${apiBaseUrl('inf-lotinput')}/lot/${encodeURIComponent(lotno)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Lot API response:', result);

      if (result.success && result.data) {
        const lotData: LotData = result.data;
        console.log('✅ Lot data found:', lotData);
        return lotData;
      } else {
        console.warn('⚠️ No lot data found for:', lotno);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching lot details:', error);
      throw error;
    }
  }

  /**
   * Validate if an inspection can create SIV
   * BUSINESS RULE: Only OQA station with Pass judgment can create SIV
   *
   * @param record - The inspection record to validate
   * @param stationCode - The current station code
   * @returns true if can create SIV, false otherwise
   */
  canCreateSIV(record: InspectionRecord, stationCode: string): boolean {
    return stationCode === 'OQA' && record.judgment === 'Pass';
  }

  /**
   * Get status color class based on judgment
   *
   * @param judgment - Pass, Reject, or empty string for pending
   * @returns Tailwind CSS classes for styling
   */
  getStatusColor(judgment: string): string {
    if (judgment === 'Pass') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (judgment === 'Reject') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }

  /**
   * Detect station type from URL path
   *
   * @param pathname - The current URL pathname
   * @returns The detected station type
   */
  detectStationFromPath(pathname: string): StationType {
    const path = pathname.toLowerCase();
    if (path.includes('oqa')) return 'OQA';
    if (path.includes('oba')) return 'OBA';
    if (path.includes('siv')) return 'SIV';
    return 'OQA'; // default
  }

  /**
   * Get date helper - returns today's date in YYYY-MM-DD format (local timezone)
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get date helper - returns date 7 days ago in YYYY-MM-DD format
   */
  getSevenDaysAgoDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }
}

// Export singleton instance
export const inspectionStationService = new InspectionStationService();

// Export class for testing
export default InspectionStationService;

/*
=== INSPECTION STATION SERVICE FEATURES ===

SIV CREATION:
✅ Create SIV from OQA Pass inspections
✅ Business rule validation (OQA + Pass only)
✅ Proper error handling with content-type validation
✅ Authentication error detection
✅ Detailed logging for debugging
✅ Type-safe response handling

LOT DETAILS:
✅ Fetch lot information by lot number
✅ RESTful API pattern
✅ Error handling and logging
✅ Type-safe lot data handling

VALIDATION:
✅ Business logic validation for SIV creation
✅ Only OQA Pass can create SIV
✅ Status color helpers

UTILITIES:
✅ Station detection from URL path
✅ Date helpers for filters
✅ Reusable utility methods

ARCHITECTURE:
✅ Centralized API configuration
✅ Singleton service pattern
✅ Separation of concerns
✅ Type safety throughout
✅ Reusable service methods
✅ Multi-station support (OQA, OBA, SIV)
*/
