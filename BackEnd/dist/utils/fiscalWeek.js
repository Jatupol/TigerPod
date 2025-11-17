"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFiscalWeekNumber = calculateFiscalWeekNumber;
exports.getFiscalYear = getFiscalYear;
exports.getFiscalWeekRange = getFiscalWeekRange;
exports.formatFiscalWeek = formatFiscalWeek;
exports.getCurrentFiscalWeek = getCurrentFiscalWeek;
exports.getCurrentFiscalYear = getCurrentFiscalYear;
exports.fiscalWeekToYearMonth = fiscalWeekToYearMonth;
function calculateFiscalWeekNumber(date, fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth();
    const currentDay = targetDate.getDate();
    let fiscalYearStartDate;
    if (currentMonth === 5) {
        const julyFirst = new Date(currentYear, 6, 1);
        julyFirst.setHours(0, 0, 0, 0);
        const julyFirstDay = julyFirst.getDay();
        let daysToFirstSaturday = (fiscalYearStartDay - julyFirstDay + 7) % 7;
        const firstSaturday = new Date(julyFirst);
        firstSaturday.setDate(julyFirst.getDate() + daysToFirstSaturday);
        const saturdayBeforeJuly = new Date(julyFirst);
        if (daysToFirstSaturday === 0) {
            saturdayBeforeJuly.setDate(julyFirst.getDate());
        }
        else {
            saturdayBeforeJuly.setDate(julyFirst.getDate() - (7 - daysToFirstSaturday + 7) % 7);
            if (saturdayBeforeJuly >= julyFirst) {
                saturdayBeforeJuly.setDate(saturdayBeforeJuly.getDate() - 7);
            }
        }
        const lastSaturdayOfJune = new Date(currentYear, 5, 30);
        while (lastSaturdayOfJune.getDay() !== 6) {
            lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
        }
        if (targetDate >= lastSaturdayOfJune) {
            return 1;
        }
    }
    if (currentMonth >= 6) {
        fiscalYearStartDate = new Date(currentYear, 6, 1);
    }
    else {
        fiscalYearStartDate = new Date(currentYear - 1, 6, 1);
    }
    fiscalYearStartDate.setHours(0, 0, 0, 0);
    const fiscalYearStartDay_actual = fiscalYearStartDate.getDay();
    let daysToFirstSaturday = (fiscalYearStartDay - fiscalYearStartDay_actual + 7) % 7;
    const firstSaturday = new Date(fiscalYearStartDate);
    firstSaturday.setDate(fiscalYearStartDate.getDate() + daysToFirstSaturday);
    firstSaturday.setHours(0, 0, 0, 0);
    if (targetDate < firstSaturday) {
        return 1;
    }
    const diffInMs = targetDate.getTime() - firstSaturday.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 2;
    return Math.max(1, Math.min(52, weekNumber));
}
function getFiscalYear(date, fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth();
    if (currentMonth === 5) {
        const lastSaturdayOfJune = new Date(currentYear, 5, 30);
        while (lastSaturdayOfJune.getDay() !== 6) {
            lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
        }
        if (targetDate >= lastSaturdayOfJune) {
            return currentYear;
        }
    }
    if (currentMonth >= 6) {
        return currentYear + 1;
    }
    else {
        return currentYear;
    }
}
function getFiscalWeekRange(fiscalYear, weekNumber, fiscalYearStartDay = 6) {
    let fiscalYearStartDate = new Date(fiscalYear - 1, 6, 1);
    fiscalYearStartDate.setHours(0, 0, 0, 0);
    const fiscalYearStartDay_actual = fiscalYearStartDate.getDay();
    let daysToFirstSaturday = (fiscalYearStartDay - fiscalYearStartDay_actual + 7) % 7;
    const firstSaturday = new Date(fiscalYearStartDate);
    firstSaturday.setDate(fiscalYearStartDate.getDate() + daysToFirstSaturday);
    firstSaturday.setHours(0, 0, 0, 0);
    if (weekNumber === 1) {
        const lastSaturdayOfJune = new Date(fiscalYear - 1, 5, 30);
        while (lastSaturdayOfJune.getDay() !== 6) {
            lastSaturdayOfJune.setDate(lastSaturdayOfJune.getDate() - 1);
        }
        const weekStart = lastSaturdayOfJune;
        const weekEnd = new Date(firstSaturday);
        weekEnd.setDate(weekEnd.getDate() - 1);
        return {
            start: weekStart,
            end: weekEnd
        };
    }
    const weekStart = new Date(firstSaturday);
    weekStart.setDate(weekStart.getDate() + (weekNumber - 2) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return {
        start: weekStart,
        end: weekEnd
    };
}
function formatFiscalWeek(date, format = 'YYYY-WW', fiscalYearStartDay = 6) {
    const targetDate = typeof date === 'string' ? new Date(date) : new Date(date);
    const fiscalYear = getFiscalYear(targetDate, fiscalYearStartDay);
    const weekNumber = calculateFiscalWeekNumber(targetDate, fiscalYearStartDay);
    const paddedWeek = String(weekNumber).padStart(2, '0');
    if (format === 'YYYY Week WW') {
        return `${fiscalYear} Week ${paddedWeek}`;
    }
    return `${fiscalYear}-${paddedWeek}`;
}
function getCurrentFiscalWeek(fiscalYearStartDay = 6) {
    return calculateFiscalWeekNumber(new Date(), fiscalYearStartDay);
}
function getCurrentFiscalYear(fiscalYearStartDay = 6) {
    return getFiscalYear(new Date(), fiscalYearStartDay);
}
function fiscalWeekToYearMonth(fiscalYearWeek, fiscalYearStartDay = 6) {
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
    const weekRange = getFiscalWeekRange(fiscalYear, weekNumber, fiscalYearStartDay);
    const weekStartDate = weekRange.start;
    const calendarYear = weekStartDate.getFullYear();
    const calendarMonth = weekStartDate.getMonth() + 1;
    const yearTwoDigit = String(calendarYear).substring(2, 4);
    const monthTwoDigit = String(calendarMonth).padStart(2, '0');
    return yearTwoDigit + monthTwoDigit;
}
