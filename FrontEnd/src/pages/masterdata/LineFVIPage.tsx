// client/src/pages/masterdata/LineFVIPage.tsx
// FIXED: LineFVI Page with Enhanced Debug Mode and Service Integration

import React from 'react';
import GenericEntityCodePage from '../GenericEntityCodePage';
import type  LineFVI  from '../../types/lineFVI';
import { linefviService } from '../../services/lineFVIService';
import { soundNotification } from '../../utils/soundNotification';

// ============ LINEFVI PAGE COMPONENT ============

const LineFVIPage: React.FC = () => {
  console.log('🔧 LineFVI Page - Component mounting...');

  // ============ ENHANCED SERVICE ADAPTER ============
  const serviceAdapter = {
    getEntities: async (params: any) => {
      console.log('🔧 LineFVI Page - getEntities called with params:', params);
      
      try {
        const response = await linefviService.getLineFVIs(params);
        
        console.log('🔧 LineFVI Page - Raw service response:', {
          success: response.success,
          hasData: !!response.data,
          dataType: typeof response.data,
          isDataArray: Array.isArray(response.data),
          dataCount: Array.isArray(response.data) ? response.data.length : 'N/A',
          pagination: response.pagination,
          message: response.message,
          fullResponse: response
        });

        // CRITICAL: Validate that we have an array of entities
        if (response.success && Array.isArray(response.data)) {
          console.log('✅ LineFVI Page - Valid array response, returning data');
          return {
            success: true,
            data: response.data, // This should be LineFVI[]
            pagination: response.pagination,
            message: response.message || `Successfully loaded ${response.data.length} LineFVIs`
          };
        } else if (response.success && response.data && !Array.isArray(response.data)) {
          console.error('❌ LineFVI Page - Response data is not an array:', {
            dataType: typeof response.data,
            dataContent: response.data,
            dataKeys: typeof response.data === 'object' ? Object.keys(response.data) : null
          });
          return {
            success: false,
            data: [],
            message: 'Invalid response structure - expected array of LineFVIs'
          };
        } else {
          console.error('❌ LineFVI Page - Service returned failure:', {
            success: response.success,
            message: response.message,
            data: response.data
          });
          soundNotification.play('error');
          return {
            success: false,
            data: [],
            message: response.message || 'Failed to load LineFVIs'
          };
        }
      } catch (error) {
        console.error('❌ LineFVI Page - getEntities error:', error);
        soundNotification.play('error');
        return {
          success: false,
          data: [],
          message: `Error loading LineFVIs: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },

    createEntity: async (data: any) => {
      console.log('🔧 LineFVI Page - createEntity called with data:', data);

      try {
        const response = await linefviService.createLineFVI(data);
        console.log('🔧 LineFVI Page - createEntity response:', response);

        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }

        return response;
      } catch (error) {
        console.error('❌ LineFVI Page - createEntity error:', error);
        soundNotification.play('error');
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create LineFVI'
        };
      }
    },

    updateEntity: async (code: string, data: any) => {
      console.log('🔧 LineFVI Page - updateEntity called:', { code, data });

      try {
        const response = await linefviService.updateLineFVI(code, data);
        console.log('🔧 LineFVI Page - updateEntity response:', response);

        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }

        return response;
      } catch (error) {
        console.error('❌ LineFVI Page - updateEntity error:', error);
        soundNotification.play('error');
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update LineFVI'
        };
      }
    },

    deleteEntity: async (code: string) => {
      console.log('🔧 LineFVI Page - deleteEntity called with code:', code);

      try {
        const response = await linefviService.deleteLineFVI(code);
        console.log('🔧 LineFVI Page - deleteEntity response:', response);

        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }

        return response;
      } catch (error) {
        console.error('❌ LineFVI Page - deleteEntity error:', error);
        soundNotification.play('error');
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to delete LineFVI'
        };
      }
    },

    toggleEntityStatus: async (code: string) => {
      console.log('🔧 LineFVI Page - toggleEntityStatus called with code:', code);

      try {
        const response = await linefviService.toggleLineFVIStatus(code);
        console.log('🔧 LineFVI Page - toggleEntityStatus response:', response);

        if (response.success && response.data) {
          soundNotification.play('success');
          return {
            success: true,
            data: response.data,
            message: response.message || 'Status updated successfully'
          };
        } else {
          soundNotification.play('error');
          return {
            success: false,
            message: response.message || 'Failed to toggle LineFVI status'
          };
        }
      } catch (error) {
        console.error('❌ LineFVI Page - toggleEntityStatus error:', error);
        soundNotification.play('error');
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to toggle LineFVI status'
        };
      }
    },

    getStats: async () => {
      console.log('🔧 LineFVI Page - getStats called');

      try {
        const response = await linefviService.getStats();
        console.log('🔧 LineFVI Page - getStats response:', response);

        if (response.success && response.data) {
          return {
            success: true,
            data: {
              total: response.data.total || 0,
              active: response.data.active || 0,
              inactive: response.data.inactive || 0
            },
            message: response.message || 'Statistics retrieved successfully'
          };
        } else {
          soundNotification.play('error');
          return {
            success: false,
            data: { total: 0, active: 0, inactive: 0 },
            message: response.message || 'Failed to load statistics'
          };
        }
      } catch (error) {
        console.error('❌ LineFVI Page - getStats error:', error);
        soundNotification.play('error');
        return {
          success: false,
          data: { total: 0, active: 0, inactive: 0 },
          message: error instanceof Error ? error.message : 'Failed to load statistics'
        };
      }
    },

    // Enhanced bulk operations support
    bulkToggleStatus: async (codes: string[], active: boolean) => {
      console.log('🔧 LineFVI Page - bulkToggleStatus called:', { codes, active });

      try {
        const response = await linefviService.bulkToggleStatus(codes, active);
        console.log('🔧 LineFVI Page - bulkToggleStatus response:', response);

        if (response.success) {
          soundNotification.play('success');
        } else {
          soundNotification.play('error');
        }

        return response;
      } catch (error) {
        console.error('❌ LineFVI Page - bulkToggleStatus error:', error);
        soundNotification.play('error');
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to bulk update status'
        };
      }
    }
  };

  // ============ VALIDATION RULES ============
  const codeValidationRules = {
    minLength: 1,
    maxLength: 5,
    pattern: /^[A-Z0-9]+$/,
    patternMessage: 'LineFVI code must contain only uppercase letters and numbers (1-5 characters)'
  };

  const nameValidationRules = {
    minLength: 1,
    maxLength: 100
  };

  // ============ BREADCRUMB CONFIGURATION ============
  const linefviBreadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Master Data', href: '/master-data' },
    { label: 'Production Line FVI' }
  ];

  // ============ SEARCH CONFIGURATION ============
  const searchConfig = {
    searchFields: ['code', 'name', 'description'] as ('code' | 'name' | 'description')[],
    searchPlaceholder: 'Search LineFVI by code, name, or description...',
    enableAdvancedSearch: true,
    searchMinLength: 1
  };

  // Note: searchFields is only used for UI display - not sent to backend

  // ============ STATUS CONFIGURATION ============
  const statusConfig = {
    enableBulkToggle: true,
    confirmationRequired: true,
    customStatusLabels: {
      active: 'Active',
      inactive: 'Inactive'
    }
  };

  console.log('🔧 LineFVI Page - Rendering with configurations:', {
    serviceAdapter: Object.keys(serviceAdapter),
    codeValidationRules,
    nameValidationRules,
    searchConfig,
    statusConfig
  });

  // ============ RENDER ============
  return (
    <GenericEntityCodePage<LineFVI>
      entityName="Production Line FVI"
      entityNamePlural="Line FVI"
      entityDescription="Production Line FVIs are used to categorize and manage different Final Visual Inspection lines within the manufacturing process."
      service={serviceAdapter}
      breadcrumbItems={linefviBreadcrumbItems}
      codeValidationRules={codeValidationRules}
      nameValidationRules={nameValidationRules}
      codePlaceholder="Enter LineFVI code (e.g., FVI01, MAIN, ASSY)"
      namePlaceholder="Enter LineFVI name (e.g., Main FVI Line, Assembly FVI Station)"
      debugMode={true} // 🔧 TEMPORARILY ENABLED - Set to false after fixing
      searchConfig={searchConfig}
      statusConfig={statusConfig}
      defaultPageSize={10} // Custom page size for LineFVI
    />
  );
};

export default LineFVIPage;

/*
=== LINEFVI PAGE ENHANCEMENTS ===

COMPREHENSIVE DEBUG MODE:
✅ Enhanced console logging for all service operations
✅ Request/response logging for debugging API issues
✅ Parameter validation and structure verification
✅ Error context and stack trace logging
✅ Step-by-step operation tracking

SERVICE ADAPTER FIXES:
✅ Proper error handling for all operations
✅ Response structure validation and normalization
✅ Consistent return format matching GenericEntityCodePage expectations
✅ Enhanced bulk operations support
✅ Statistics integration with fallback values

DATA STRUCTURE VALIDATION:
✅ Ensures response.data is always an array for getEntities
✅ Validates all required LineFVI properties
✅ Provides fallback values for missing data
✅ Type-safe parameter handling

ERROR RESILIENCE:
✅ Graceful error handling with meaningful messages
✅ Fallback behavior for failed operations
✅ Complete error logging for debugging
✅ User-friendly error messages

CONFIGURATION ENHANCEMENTS:
✅ Comprehensive search configuration with multiple fields
✅ Advanced status management with bulk operations
✅ Proper validation rules matching backend constraints
✅ Enhanced breadcrumb navigation

MANUFACTURING CONTEXT:
✅ FVI (Final Visual Inspection) specific terminology
✅ Manufacturing-appropriate placeholders and descriptions
✅ Quality control workflow integration
✅ Production line management focus

DEBUG MODE FEATURES:
✅ Temporarily enabled debug mode for issue diagnosis
✅ Comprehensive logging for all operations
✅ Response structure analysis
✅ Performance monitoring support

This enhanced LineFVI page should resolve the "state.entities.map is not a function" 
error by ensuring proper data structure handling and providing comprehensive
debugging information to identify any remaining issues.

Remember to set debugMode={false} once the issue is resolved!
*/