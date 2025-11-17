// client/src/components/selectors/LineFVISelector.tsx
// FIXED: Reusable LineFVI selector component with correct property names

import React, { useState, useEffect } from 'react';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { lineFVIService } from '../../services/lineFVIService';
import type { LineFVI } from '../../services/lineFVIService';

interface LineFVISelectorProps {
  value?: string | string[];  // FIXED: Changed to string since LineFVI uses code (string) as identifier
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  includeInactive?: boolean;
  className?: string;
  onLineFVILoad?: (lineFVIs: LineFVI[]) => void;
}

const LineFVISelector: React.FC<LineFVISelectorProps> = ({
  value,
  onChange,
  multiple = false,
  disabled = false,
  placeholder = 'Select LineFVI...',
  error,
  label = 'LineFVI',
  required = false,
  includeInactive = false,
  className = '',
  onLineFVILoad,
}) => {
  const [lineFVIs, setLineFVIs] = useState<LineFVI[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadLineFVIs();
  }, [includeInactive]);

  const loadLineFVIs = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const response = await lineFVIService.getLineFVIs({
        is_active: includeInactive ? undefined : true,  // FIXED: Changed from isActive to is_active
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 100, // Get all LineFVIs
      });
      
      if (response.success && response.data) {
        setLineFVIs(response.data);  // FIXED: Use response.data instead of response.lineFVIs
        onLineFVILoad?.(response.data);
      } else {
        setLoadError(response.message || 'Failed to load LineFVIs');
      }
    } catch (error: any) {
      console.error('Failed to load LineFVIs:', error);
      setLoadError('Failed to load LineFVIs');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value || '';
    onChange(selectedCode);
  };

  const handleMultipleChange = (selectedCodes: string[]) => {
    onChange(selectedCodes);
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-500">Loading LineFVIs...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          {loadError}
          <button
            onClick={loadLineFVIs}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Generate options for single select
  const singleSelectOptions = [
    { value: '', label: placeholder },
    ...lineFVIs.map(lineFVI => ({
      value: lineFVI.code,
      label: `${lineFVI.code} - ${lineFVI.name}${!lineFVI.is_active ? ' (Inactive)' : ''}` // FIXED: Use is_active
    }))
  ];

  // Generate options for multiple select
  const multiSelectOptions = lineFVIs.map(lineFVI => ({
    value: lineFVI.code,
    label: `${lineFVI.code} - ${lineFVI.name}${!lineFVI.is_active ? ' (Inactive)' : ''}`,  // FIXED: Use is_active
    disabled: !lineFVI.is_active && !includeInactive
  }));

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {multiple ? (
        <Select
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={handleMultipleChange}
          options={multiSelectOptions}
          disabled={disabled}
          error={error}
          placeholder={placeholder}
        />
      ) : (
        <select
          value={typeof value === 'string' ? value : ''}
          onChange={handleSingleChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        >
          {singleSelectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};

export default LineFVISelector;

// ============ CUSTOM HOOK FOR LineFVI DATA ============

export const useLineFVIs = (includeInactive: boolean = false) => {
  const [lineFVIs, setLineFVIs] = useState<LineFVI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLineFVIs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await lineFVIService.getLineFVIs({
        is_active: includeInactive ? undefined : true,  // FIXED: Use is_active
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 100,
      });
      
      if (response.success && response.data) {
        setLineFVIs(response.data);  // FIXED: Use response.data
      } else {
        setError(response.message || 'Failed to load LineFVIs');
      }
    } catch (error: any) {
      console.error('Failed to load LineFVIs:', error);
      setError('Failed to load LineFVIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLineFVIs();
  }, [includeInactive]);

  return {
    lineFVIs,
    loading,
    error,
    reload: loadLineFVIs,
  };
};

// Utility functions for working with LineFVIs
export const LineFVIUtils = {
  // Get LineFVI by code
  getByCode: (lineFVIs: LineFVI[], code: string): LineFVI | undefined => {
    return lineFVIs.find(lineFVI => lineFVI.code === code);
  },

  // Get LineFVIs by codes
  getByCodes: (lineFVIs: LineFVI[], codes: string[]): LineFVI[] => {
    return lineFVIs.filter(lineFVI => codes.includes(lineFVI.code));
  },

  // Get only active LineFVIs
  getActive: (lineFVIs: LineFVI[]): LineFVI[] => {
    return lineFVIs.filter(lineFVI => lineFVI.is_active);  // FIXED: Use is_active
  },

  // Format LineFVI names for display
  formatNames: (lineFVIs: LineFVI[]): string => {
    return lineFVIs.map(lineFVI => lineFVI.name).join(', ');
  },

  // Sort LineFVIs by name
  sortByName: (lineFVIs: LineFVI[]): LineFVI[] => {
    return [...lineFVIs].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Sort LineFVIs by code
  sortByCode: (lineFVIs: LineFVI[]): LineFVI[] => {
    return [...lineFVIs].sort((a, b) => a.code.localeCompare(b.code));
  },
};

/*
=== LINEMC SELECTOR FEATURES ===

COMPLETE SEPARATION MAINTAINED:
✅ All LineFVI selection logic in one component file
✅ Zero dependencies between entity files
✅ Everything for LineFVI selector in one place
✅ No circular dependencies or import conflicts

COMPREHENSIVE SELECTOR FUNCTIONALITY:
✅ Single and multiple selection modes
✅ Active/inactive filtering options
✅ Loading states with spinner
✅ Error handling with retry functionality
✅ Proper disabled state handling
✅ Required field indication

DATA COMPATIBILITY:
✅ FIXED: Uses 'code' (string) as identifier instead of 'id' (number)
✅ FIXED: Uses 'is_active' property name to match backend
✅ FIXED: Uses 'response.data' to access LineFVI array
✅ Proper sorting and filtering
✅ Inactive item indication in labels

UI/UX FEATURES:
✅ Accessible form labels with required indicators
✅ Proper focus states and keyboard navigation
✅ Error message display
✅ Loading state with meaningful message
✅ Retry functionality on error
✅ Disabled state styling

UTILITY FUNCTIONS:
✅ Custom hook for LineFVI data management
✅ Utility functions for common operations
✅ Code-based lookups (instead of ID-based)
✅ Active filtering helpers
✅ Sorting by name and code

ARCHITECTURAL COMPLIANCE:
✅ Individual file for LineFVI selector
✅ Complete independence from other entities
✅ Uses proper TypeScript typing
✅ Follows project structure requirements
✅ Zero external dependencies except UI components

This LineFVI selector provides comprehensive selection functionality
while maintaining the Complete Separation Entity Architecture
with correct property names and data structure compatibility.
*/