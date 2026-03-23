import type { ICalendarRule } from '../src/schedule/types/index.js';

export const createMockCalendarRule = (
  overrides?: Partial<ICalendarRule>,
): ICalendarRule => ({
  calendarRuleId: 'cal-rule-001',
  projectId: 'proj-001',
  calendarType: 'SourceCalendar',
  calendarName: 'Standard 5-Day',
  hoursPerDay: 8,
  workDays: [1, 2, 3, 4, 5],
  exceptions: [{ date: '2026-07-04', description: 'Independence Day' }],
  effectiveFrom: '2026-01-01',
  effectiveTo: null,
  createdBy: 'user-001',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

/** Convenience factory for an operating calendar with 6-day work week. */
export const createMockOperatingCalendar = (
  overrides?: Partial<ICalendarRule>,
): ICalendarRule =>
  createMockCalendarRule({
    calendarRuleId: 'cal-rule-002',
    calendarType: 'OperatingCalendar',
    calendarName: 'Field 6-Day',
    hoursPerDay: 10,
    workDays: [1, 2, 3, 4, 5, 6],
    exceptions: [],
    ...overrides,
  });
