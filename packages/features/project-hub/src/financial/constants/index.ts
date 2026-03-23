import type {
  FinancialAccessAction,
  FinancialAuthorityRole,
  FinancialVersionState,
  IFinancialIntegrationBoundary,
} from '../types/index.js';

/**
 * P3-E4-T01 contract constants.
 * Values are locked for contract stability.
 */

export const FINANCIAL_MODULE_SCOPE = 'financial' as const;

export const FINANCIAL_VERSION_STATES = [
  'Working',
  'ConfirmedInternal',
  'PublishedMonthly',
  'Superseded',
] as const satisfies ReadonlyArray<FinancialVersionState>;

export const FINANCIAL_AUTHORITY_ROLES = [
  'PM',
  'PER',
  'Leadership',
] as const satisfies ReadonlyArray<FinancialAuthorityRole>;

export const FINANCIAL_ACCESS_ACTIONS = [
  'read',
  'write',
  'annotate',
  'derive',
  'designate-report-candidate',
] as const satisfies ReadonlyArray<FinancialAccessAction>;

/**
 * Integration boundaries declared by T01 §1.5.
 * Each entry describes a directional data flow contract.
 */
export const FINANCIAL_INTEGRATION_BOUNDARIES: ReadonlyArray<IFinancialIntegrationBoundary> = [
  {
    key: 'procore-budget-import',
    direction: 'inbound',
    source: 'Procore',
    target: 'Financial',
    description: 'Budget line import (CSV today; direct API in future); actuals and committed costs',
    status: 'active',
  },
  {
    key: 'erp-ar-aging',
    direction: 'inbound',
    source: 'ERP',
    target: 'Financial',
    description: 'A/R aging data via daily sync; read-only display',
    status: 'planned',
  },
  {
    key: 'financial-to-reports',
    direction: 'outbound',
    source: 'Financial',
    target: 'Reports (P3-F1)',
    description: 'Confirmed snapshot designated as report candidate; published version on finalization',
    status: 'planned',
  },
  {
    key: 'financial-to-health-spine',
    direction: 'outbound',
    source: 'Financial',
    target: 'Health spine',
    description: 'Project financial health metrics on confirmation (T08 §8.2)',
    status: 'planned',
  },
  {
    key: 'financial-to-work-queue',
    direction: 'outbound',
    source: 'Financial',
    target: 'Work Queue',
    description: 'Action items for PM on reconciliation, overbudget conditions, savings disposition (T08 §8.3)',
    status: 'planned',
  },
] as const;
