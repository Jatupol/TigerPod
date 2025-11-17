// client/src/services/inspectionCustomerService.ts
// Service for Customer Inspection Operations
// OQA Station Customer Inspection - Complete Separation Entity Architecture

import { apiBaseUrl } from '../config/api.config';
import type { InspectionRecord } from '../types/inspectiondata';
import type { LotData } from '../types/inf-lotinput';
import type { SIVCreationResponse, SIVCreationResult } from '../types/inspection-station';

/**
 * Customer Inspection Service Class
 * Handles all API operations for customer inspection page
 */
class InspectionCustomerService {
  /**
   * Create SIV inspection from OQA inspection
   *
   * @param inspectionId - The ID of the OQA inspection record
   * @returns SIVCreationResult with success status and details
   */
  async createSIVFromOQA(inspectionId: string): Promise<SIVCreationResult> {
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
   * Only OQA station with Pass judgment can create SIV
   *
   * @param record - The inspection record to validate
   * @returns true if can create SIV, false otherwise
   */
  canCreateSIV(record: InspectionRecord): boolean {
    return record.judgment === 'Pass' && record.station === 'OQA';
  }

  /**
   * Get status color class based on judgment
   *
   * @param judgment - Pass or Reject
   * @returns Tailwind CSS classes for styling
   */
  getStatusColor(judgment: string): string {
    return judgment === 'Pass'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }
}

// Export singleton instance
export const inspectionCustomerService = new InspectionCustomerService();

// Export class for testing
export default InspectionCustomerService;

/*
=== INSPECTION CUSTOMER SERVICE FEATURES ===

SIV CREATION:
✅ Create SIV from OQA Pass inspections
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

ARCHITECTURE:
✅ Centralized API configuration
✅ Singleton service pattern
✅ Separation of concerns
✅ Type safety throughout
✅ Reusable service methods
*/
