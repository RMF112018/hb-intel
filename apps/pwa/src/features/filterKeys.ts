/**
 * D-PH6F-08: Canonical domain filter keys — prevents typos and key collisions across list pages.
 * Add a new key for every list page that uses useDomainFilters / useListFilterStoreBinding.
 * Blueprint §4b (Data grid UX).
 */
export const FILTER_KEYS = {
  ACCOUNTING_INVOICES: 'accounting-invoices',
  ACCOUNTING_REPORTS: 'accounting-reports',
  ESTIMATING_PROJECTS: 'estimating-projects',
  ESTIMATING_QUOTES: 'estimating-quotes',
  BD_LEADS: 'bd-leads',
  BD_SCORECARDS: 'bd-scorecards',
  PROJECT_HUB_PROJECTS: 'project-hub-projects',
  PROJECT_HUB_TASKS: 'project-hub-tasks',
} as const;

export type FilterKey = (typeof FILTER_KEYS)[keyof typeof FILTER_KEYS];
