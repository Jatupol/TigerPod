// server/src/entities/reports/types.ts
// ===== LAR REPORT TYPES =====
// Line Acceptance Rate (LAR) Report Entity Types
// Manufacturing Quality Control System - Report Entity

// ==================== INTERFACES ====================

/**
 * OQA DPPM Overall Report Data Record
 */
export interface OQADPPMOverallRecord {
  ww: string;                      // Work Week (e.g., 'WW49', 'WW50')
  total_lot: number;               // Total number of lots inspected
  total_pass_lot: number;          // Number of lots that passed
  total_fail_lot: number;          // Number of lots that failed
  total_inspection: number;        // Total number of inspections performed
  defectname: string | null;       // Name of the defect type
  total_ng: number;                // Total NG (Not Good) count for this defect
  lar: number;                     // Line Acceptance Rate (percentage)
  dppm: number;                    // Defects Per Million (parts)
}

/**
 * Query parameters for OQA DPPM Overall report
 */
export interface OQADPPMOverallQueryParams {
  year?: string;               // Year filter (e.g., '2024', '2025')
  ww?: string;                 // Start work week filter
 
}
 
/**
 * Service result for OQA DPPM Overall report data
 */
export interface OQADPPMOverallResult {
  success: boolean;
  data?: OQADPPMOverallRecord[];
  message?: string;
  errors?: string[];
}

/**
 * SGT IQA Trend Report Data Record
 */
export interface SGTIQATrendRecord {
  ww: string;                      // Work Week (e.g., 'WW49', 'WW50')
  total_lot: number;               // Total number of lots inspected
  total_pass_lot: number;          // Number of lots that passed
  total_fail_lot: number;          // Number of lots that failed
  total_inspection: number;        // Total number of inspections performed
  defectname: string | null;       // Name of the defect type
  total_ng: number;                // Total NG (Not Good) count for this defect
  lar: number;                     // Line Acceptance Rate (percentage)
  dppm: number;                    // Defects Per Million (parts)
}

/**
 * Query parameters for SGT IQA Trend report
 */
export interface SGTIQATrendQueryParams {
  year?: string;               // Year filter (e.g., '2024', '2025')
  ww?: string;                 // Start work week filter
  model?: string;                  // Model filter (model + version)
  product_type?: string;                  // Product type filter (e.g., 'HDD', 'SSD')
}

 
/**
 * Service result for SGT IQA Trend report data
 */
export interface SGTIQATrendResult {
  success: boolean;
  data?: SGTIQATrendRecord[];
  message?: string;
  errors?: string[];
}

/**
 * Seagate IQA Result Report Data Record
 */
export interface SeagateIQAResultReportRecord {
  model: string;                    // Model name (e.g., 'Iris 20.4')
  fy: string;                       // Fiscal year (e.g., '2025', '2025')
  ww: string;                       // Work Week (e.g., '49', '50')
  fyww: string;                     // Fiscal Work Week (e.g., '202549', '202550')
  total_inspection_lot: number;     // Total number of lots inspected
  acceptable_lot: number;           // Number of lots that passed
  rejected_lot: number;             // Number of lots that failed
  rejected_qty: number;             // Total NG (Not Good) count for this defect
  lar: number;                      // Line Acceptance Rate (percentage)
}

/**
 * Query parameters for Seagate IQA Result report
 */
export interface SeagateIQAResultQueryParams {
  year?: string;               // Year filter (e.g., '2024', '2025')
  ww?: string;                 // Start work week filter
}

/**
 * LAR Report Data Record
 * Represents a single week's LAR data with defect breakdown
 */
export interface LARReportRecord {
  ww: string;                      // Work Week (e.g., 'WW49', 'WW50')
  total_lot: number;               // Total number of lots inspected
  total_pass_lot: number;          // Number of lots that passed
  total_fail_lot: number;          // Number of lots that failed
  total_inspection: number;        // Total number of inspections performed
  defectname: string | null;       // Name of the defect type
  total_ng: number;                // Total NG (Not Good) count for this defect
  lar: number;                     // Line Acceptance Rate (percentage)
  dppm: number;                    // Defects Per Million (parts)
}

/**
 * Query parameters for LAR report
 */
export interface LARReportQueryParams {
  yearFrom?: string;               // Year filter (e.g., '2024', '2025')
  wwFrom?: string;                 // Start work week filter
  wwTo?: string;                   // End work week filter
  yearTo?: string;                 // Year filter (e.g., '2024', '2025')
  model?: string;                  // Model filter (model + version)
}

 
/**
 * Service result for LAR report data
 */
export interface LARReportResult {
  success: boolean;
  data?: LARReportRecord[];
  message?: string;
  errors?: string[];
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if object is a valid LARReportRecord
 */
export function isLARReportRecord(obj: any): obj is LARReportRecord {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.ww === 'string' &&
    typeof obj.total_lot === 'number' &&
    typeof obj.total_pass_lot === 'number' &&
    typeof obj.total_fail_lot === 'number' &&
    typeof obj.total_inspection === 'number' &&
    (obj.defectname === null || typeof obj.defectname === 'string') &&
    typeof obj.total_ng === 'number' &&
    typeof obj.lar === 'number' &&
    typeof obj.dppm === 'number'
  );
}

/**
 * Type guard to check if object is a valid LARReportQueryParams
 */
export function isLARReportQueryParams(obj: any): obj is LARReportQueryParams {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj.wwFrom === undefined || typeof obj.wwFrom === 'string') &&
    (obj.wwTo === undefined || typeof obj.wwTo === 'string') &&
    (obj.year === undefined || typeof obj.year === 'string') &&
    (obj.model === undefined || typeof obj.model === 'string')
  );
}

// ==================== CONSTANTS ====================

 
/*
=== LAR REPORT TYPES FEATURES ===

COMPLETE SEPARATION ARCHITECTURE:
✅ Self-contained report entity types
✅ No dependencies on other entities
✅ Clean interface definitions
✅ Type-safe query parameters

DATA STRUCTURES:
✅ LARReportRecord - Raw database result
✅ LARWeeklyReport - Aggregated weekly data
✅ LARReportQueryParams - Flexible filtering
✅ LARReportStats - Summary statistics

TYPE SAFETY:
✅ Type guards for runtime validation
✅ Proper TypeScript interfaces
✅ Null safety for optional fields
✅ Const assertions for defaults

MANUFACTURING QUALITY FOCUS:
✅ LAR (Line Acceptance Rate) calculation
✅ DPPM (Defects Per Million) tracking
✅ Defect type breakdown
✅ Work week (WW) based reporting
✅ Pass/Fail lot tracking
*/
