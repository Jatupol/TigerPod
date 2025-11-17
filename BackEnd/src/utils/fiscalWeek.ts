// server/src/utills/fiscalWeek.ts
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
 * Convert fiscal year and week to calendar year and month
 * Takes fiscal week format (YYYYWW like "202401") and returns year-month format (YYMM like "2406")
 *
 * @param fiscalYearWeek - Fiscal year and week in format YYYYWW (e.g., "202401")
 * @param fiscalYearStartDay - The day of week weeks start on (6 = Saturday). Default is 6 (Saturday)
 * @returns Year and month in format YYMM (e.g., "2406")
 *
 * @example
 * // FY2024 Week 01 starts in late June 2024
 * fiscalWeekToYearMonth("202401"); // Returns "2406"
 *
 * @example
 * // FY2024 Week 10 is in August 2024
 * fiscalWeekToYearMonth("202410"); // Returns "2408"
 */
export function fiscalWeekToYearMonth(
  fiscalYearWeek: string,
  fiscalYearStartDay: number = 6
): string {
  // Parse input format YYYYWW
  if (fiscalYearWeek.length !== 6) {
    throw new Error('Invalid fiscal year week format. Expected YYYYWW (e.g., "202401")');
  }

  const fiscalYear = parseInt(fiscalYearWeek.substring(0, 4));
  const weekNumber = parseInt(fiscalYearWeek.substring(4, 6));

  if (isNaN(fiscalYear) || isNaN(weekNumber)) {
    throw new Error('Invalid fiscal year week format. Year and week must be numbers.');
  }

  if (weekNumber < 1 || weekNumber > 52) {
    throw new Error('Week number must be between 1 and 52');
  }

  // Get the fiscal week range to find the start date
  const weekRange = getFiscalWeekRange(fiscalYear, weekNumber, fiscalYearStartDay);
  const weekStartDate = weekRange.start;

  // Extract calendar year and month from the week start date
  const calendarYear = weekStartDate.getFullYear();
  const calendarMonth = weekStartDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

  // Format as YYMM
  const yearTwoDigit = String(calendarYear).substring(2, 4); // Get last 2 digits of year
  const monthTwoDigit = String(calendarMonth).padStart(2, '0');

  return yearTwoDigit + monthTwoDigit;
}
