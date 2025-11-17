// client/src/utils/formatUtils.ts
/**
 * Formating data Utilities
 * 
 * Helper functions for working with formating data
 */

 

/**
 * Format number
 *
 * @param stringNumber
 * @param decimals - Optional number of decimal places to display
 * @returns String with commas as thousand separators
 *
 * @example
 * formatNumber(1234567); // Returns "1,234,567"
 * formatNumber("9876543"); // Returns "9,876,543"
 * formatNumber("1234.5678", 2); // Returns "1,234.57"
 * formatNumber("1234.5", 2); // Returns "1,234.50"
 */
export function formatNumber(stringNumber: string = '0', decimals?: number): string {
  const num = parseFloat(stringNumber);

  if (isNaN(num)) {
    return '0';
  }

  // Apply decimal formatting if specified
  const formattedNum = decimals !== undefined
    ? num.toFixed(decimals)
    : stringNumber;

  // Add thousands separator
  return formattedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


 

 