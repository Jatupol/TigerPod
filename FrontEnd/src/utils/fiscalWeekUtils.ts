// client/src/utills/fiscalWeekUtils.ts
/**
 * Fiscal Week Utilities
 *
 * Helper functions for calculating fiscal week numbers
 *
 * FISCAL YEAR RULES:
 * 1. Fiscal year begins on July 1st
 * 2. New weeks start on Saturday
 * 3. Fiscal year runs from July 1st to June 30th of the following calendar year
 * 4. The last few days of June (before July 1st) belong to Week 1 of the NEXT fiscal year
 */

/**
 * Calculate fiscal week number based on a date
 * Fiscal year starts on July 1st, weeks start on Saturday
 * Days before July 1st in late June belong to Week 1 of the next fiscal year
 *
 * @param date - The date to calculate the fiscal week for
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The fiscal week number (1-52)
 */
export function calculateFiscalWeekNumber(
  date: Date | string,
  fiscalYearStartDay: number = 6
): number {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
  targetDate.setHours(0, 0, 0, 0); // Normalize to start of day

  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth(); // 0-11 (January = 0, July = 6)
  const currentDay = targetDate.getDate();

  // Determine which fiscal year this date belongs to
  let fiscalYearStartDate: Date;

  // Special case: Days in late June (before July 1st) belong to Week 1 of the NEXT fiscal year
  if (currentMonth === 5) { // June (month 5)
    // Check if we're in the last Saturday before July 1st or later
    const julyFirst = new Date(currentYear, 6, 1); // July 1st of current year
    julyFirst.setHours(0, 0, 0, 0);

    const julyFirstDay = julyFirst.getDay(); // Day of week for July 1st
    let daysToFirstSaturday = (fiscalYearStartDay - julyFirstDay + 7) % 7;

    const firstSaturday = new Date(julyFirst);
    firstSaturday.setDate(julyFirst.getDate() + daysToFirstSaturday);

    // If target date is on or after the Saturday before July 1st, it's Week 1 of next FY
    const saturdayBeforeJuly = new Date(julyFirst);
    if (daysToFirstSaturday === 0) {
      // July 1st IS Saturday - week 1 starts on July 1st
      saturdayBeforeJuly.setDate(julyFirst.getDate());
    } else {
      // Find the Saturday before July 1st
      saturdayBeforeJuly.setDate(julyFirst.getDate() - (7 - daysToFirstSaturday + 7) % 7);
      if (saturdayBeforeJuly >= julyFirst) {
        saturdayBeforeJuly.setDate(saturdayBeforeJuly.getDate() - 7);
      }
    }

    // Check if we're in late June (the last Saturday before July or later)
    const lastSaturdayOfJune = new Date(currentYear, 5, 30); // June 30
    while (lastSaturdayOfJune.getDay() !== 6) {
      lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
    }

    if (targetDate >= lastSaturdayOfJune) {
      // We're in Week 1 of the next fiscal year
      return 1;
    }
  }

  if (currentMonth >= 6) {
    // July to December: fiscal year started in July of current calendar year
    fiscalYearStartDate = new Date(currentYear, 6, 1); // July 1st of current year
  } else {
    // January to early June: fiscal year started in July of previous calendar year
    fiscalYearStartDate = new Date(currentYear - 1, 6, 1); // July 1st of previous year
  }

  // Find the first Saturday on or after July 1st
  fiscalYearStartDate.setHours(0, 0, 0, 0);
  const fiscalYearStartDay_actual = fiscalYearStartDate.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate days to add to reach the first Saturday
  let daysToFirstSaturday = (fiscalYearStartDay - fiscalYearStartDay_actual + 7) % 7;

  const firstSaturday = new Date(fiscalYearStartDate);
  firstSaturday.setDate(fiscalYearStartDate.getDate() + daysToFirstSaturday);
  firstSaturday.setHours(0, 0, 0, 0);

  // If the target date is before the first Saturday, it belongs to Week 1
  if (targetDate < firstSaturday) {
    return 1;
  }

  // Calculate the difference in days from the first Saturday
  const diffInMs = targetDate.getTime() - firstSaturday.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Calculate week number (Week 1 is the partial week before the first Saturday,
  // Week 2 starts on the first Saturday, etc.)
  const weekNumber = Math.floor(diffInDays / 7) + 2;

  // Ensure week number is within valid range (1-52)
  return Math.max(1, Math.min(52, weekNumber));
}

/**
 * Get the fiscal year from a date
 * Fiscal year begins on July 1st and runs to June 30th of the following calendar year
 * Fiscal year is named after the year in which it ENDS (e.g., FY2025 = July 2024 - June 2025)
 * Special case: Last few days of June (before July 1st) belong to the current fiscal year (week 53)
 *
 * @param date - The date to get the fiscal year for
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns The fiscal year number
 *
 * @example
 * // For a date in August 2024
 * getFiscalYear(new Date('2024-08-15'), 6); // Returns 2025 (FY2025 runs July 2024 - June 2025)
 *
 * @example
 * // For a date in January 2025
 * getFiscalYear(new Date('2025-01-15'), 6); // Returns 2025 (still in FY2025)
 *
 * @example
 * // For a date in late June 2025 (after the last Saturday - week 53)
 * getFiscalYear(new Date('2025-06-30'), 6); // Returns 2025 (Week 53 of FY2025)
 *
 * @example
 * // For a date in July 2025
 * getFiscalYear(new Date('2025-07-01'), 6); // Returns 2026 (FY2026 starts)
 */
export function getFiscalYear(
  date: Date | string,
  fiscalYearStartDay: number = 6
): number {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);

  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth(); // 0-11 (January = 0, July = 6)

  // Special case: Late June (last Saturday before July 1st or later) belongs to current fiscal year (week 53)
  if (currentMonth === 5) { // June
    // Find the last Saturday of June
    const lastSaturdayOfJune = new Date(currentYear, 5, 30); // June 30
    while (lastSaturdayOfJune.getDay() !== 6) {
      lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
    }

    if (targetDate >= lastSaturdayOfJune) {
      // We're in Week 53 of the current fiscal year (which ends in current calendar year)
      return currentYear;
    }
  }

  // If we're in July or later (months 6-11), we're in the fiscal year that ends NEXT calendar year
  // If we're before late June (months 0-5), we're in the fiscal year that ends THIS calendar year
  if (currentMonth >= 6) {
    return currentYear + 1;
  } else {
    return currentYear;
  }
}

/**
 * Get fiscal week range (start and end dates) for a given week number
 *
 * @param fiscalYear - The fiscal year (e.g., 2025 for FY2025 which runs July 2024 - June 2025)
 * @param weekNumber - The fiscal week number (1-52)
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns Object containing start and end dates of the fiscal week
 */
export function getFiscalWeekRange(
  fiscalYear: number,
  weekNumber: number,
  fiscalYearStartDay: number = 6
): { start: Date; end: Date } {
  // Fiscal year starts on July 1st of the PREVIOUS calendar year
  // (e.g., FY2025 starts July 1, 2024)
  let fiscalYearStartDate = new Date(fiscalYear - 1, 6, 1); // July 1st of previous year
  fiscalYearStartDate.setHours(0, 0, 0, 0);

  // Find the first Saturday on or after July 1st
  const fiscalYearStartDay_actual = fiscalYearStartDate.getDay();
  let daysToFirstSaturday = (fiscalYearStartDay - fiscalYearStartDay_actual + 7) % 7;

  const firstSaturday = new Date(fiscalYearStartDate);
  firstSaturday.setDate(fiscalYearStartDate.getDate() + daysToFirstSaturday);
  firstSaturday.setHours(0, 0, 0, 0);

  // Week 1 starts on the last Saturday of June (or July 1st if that's a Saturday)
  if (weekNumber === 1) {
    // Find the last Saturday of June (fiscal year - 1)
    // e.g., for FY2025, find last Saturday of June 2024
    const lastSaturdayOfJune = new Date(fiscalYear - 1, 5, 30); // June 30 of previous year
    while (lastSaturdayOfJune.getDay() !== 6) {
      lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
    }

    const weekStart = lastSaturdayOfJune;
    const weekEnd = new Date(firstSaturday);
    weekEnd.setDate(weekEnd.getDate() - 1); // Day before first Saturday after July 1st

    return {
      start: weekStart,
      end: weekEnd
    };
  }

  // Week 2+ start on Saturdays
  const weekStart = new Date(firstSaturday);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 2) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // Saturday to Friday (7 days total)

  return {
    start: weekStart,
    end: weekEnd
  };
}

/**
 * Format fiscal week as a string
 *
 * @param date - The date to format
 * @param format - The format string ('YYYY-WW' or 'YYYY Week WW'). Default is 'YYYY-WW'
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns Formatted fiscal week string
 */
export function formatFiscalWeek(
  date: Date | string,
  format: 'YYYY-WW' | 'YYYY Week WW' = 'YYYY-WW',
  fiscalYearStartDay: number = 6
): string {
  const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
  const fiscalYear = getFiscalYear(targetDate, fiscalYearStartDay);
  const weekNumber = calculateFiscalWeekNumber(targetDate, fiscalYearStartDay);
  const paddedWeek = String(weekNumber).padStart(2, '0');

  if (format === 'YYYY Week WW') {
    return `${fiscalYear} Week ${paddedWeek}`;
  }

  return `${fiscalYear}-${paddedWeek}`;
}

/**
 * Get the current fiscal week number
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal week number
 */
export function getCurrentFiscalWeek(fiscalYearStartDay: number = 6): number {
  return calculateFiscalWeekNumber(new Date(), fiscalYearStartDay);
}

/**
 * Get the current fiscal year
 *
 * @param fiscalYearStartDay - The day of week weeks start on. Default is 6 (Saturday)
 * @returns The current fiscal year number
 */
export function getCurrentFiscalYear(fiscalYearStartDay: number = 6): number {
  return getFiscalYear(new Date(), fiscalYearStartDay);
}

/**
 * Convert yearmonth format to month name format
 * Converts numeric yearmonth (YYYYMM) to abbreviated month name with year (MMM`YY)
 *
 * @param yearmonth - The yearmonth in YYYYMM format (e.g., "202406" or 202406)
 * @returns Formatted month name string (e.g., "Jun`24")
 *
 * @example
 * getMonthName("2406"); // Returns "Jun`24"
 * getMonthName(2412); // Returns "Dec`24"
 * getMonthName("2501"); // Returns "Jan`25"
 */
export function getMonthName(yearmonth: string | number): string {
  // Convert to string if number
  const yearmonthStr = String(yearmonth);

  // Validate format (should be 6 digits: YYYYMM)
  if (yearmonthStr.length !== 4 || isNaN(Number(yearmonthStr))) {
    console.warn(`Invalid yearmonth format: ${yearmonth}. Expected YYYYMM format.`);
    return String(yearmonth); // Return as-is if invalid
  }

  // Extract year and month
  const year = yearmonthStr.substring(0, 2);
  const month = yearmonthStr.substring(2, 4);

  // Convert month number to abbreviated month name
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthIndex = parseInt(month, 10) - 1; // Month is 1-based, array is 0-based

  // Validate month range
  if (monthIndex < 0 || monthIndex > 11) {
    console.warn(`Invalid month in yearmonth: ${yearmonth}. Month should be 01-12.`);
    return String(yearmonth); // Return as-is if invalid
  }

  const monthName = monthNames[monthIndex];

  return `${monthName}\`${year}`;
}



/**
 * Convert yearmonth format to month name format
 * Converts numeric yearmonth (YYYYMM) to abbreviated month name with year (MMM`YY)
 *
 * @param yearmonthtrend - The yearmonth in YYYYMMWW format (e.g., "20240619" or 20240699)
 * @returns Formatted month name string (e.g., "Jun`24")
 *
 * @example
 * getMonthTrendName("240699"); // Returns "Jun`24"
 * getMonthTrendName(241299); // Returns "Dec`24"
 * getMonthTrendName("250112"); // Returns "WW12 Jan`25" 
 */
export function getMonthTrendName(yearmonthtrend: string = ''): string {
 
  const lastTwo = yearmonthtrend.slice(-2);
  const yearmonth =  getMonthName(yearmonthtrend.toString().substring(0, 4));
  const result = lastTwo !== "99" ? "WW" + lastTwo +" "+ yearmonth : yearmonth;

  return  result ;
}
