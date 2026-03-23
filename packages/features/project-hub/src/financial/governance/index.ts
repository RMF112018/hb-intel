import type {
  FinancialAccessAction,
  IFinancialAccessQuery,
  IFinancialAccessResult,
} from '../types/index.js';
import { FINANCIAL_ACCESS_ACTIONS } from '../constants/index.js';

export const FINANCIAL_GOVERNANCE_SCOPE = 'financial/governance';

/**
 * Resolve Financial module access rules for a given role and version state.
 * Pure deterministic function — no side effects, no external dependencies.
 *
 * Implements the access matrix from P3-E4-T01 §1.4.
 */
export const resolveFinancialVersionAccess = (
  query: IFinancialAccessQuery,
): IFinancialAccessResult => {
  const allowed: FinancialAccessAction[] = [];
  const denied: FinancialAccessAction[] = [];
  let hidden = false;

  const { role, versionState } = query;

  switch (role) {
    case 'PM':
      switch (versionState) {
        case 'Working':
          allowed.push('read', 'write');
          denied.push('annotate', 'derive', 'designate-report-candidate');
          break;
        case 'ConfirmedInternal':
          allowed.push('read', 'derive', 'designate-report-candidate');
          denied.push('write', 'annotate');
          break;
        case 'PublishedMonthly':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
        case 'Superseded':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
      }
      break;

    case 'PER':
      switch (versionState) {
        case 'Working':
          // Key principle: PER never sees the PM's working draft
          hidden = true;
          break;
        case 'ConfirmedInternal':
          allowed.push('read', 'annotate');
          denied.push('write', 'derive', 'designate-report-candidate');
          break;
        case 'PublishedMonthly':
          allowed.push('read', 'annotate');
          denied.push('write', 'derive', 'designate-report-candidate');
          break;
        case 'Superseded':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
      }
      break;

    case 'Leadership':
      switch (versionState) {
        case 'Working':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
        case 'ConfirmedInternal':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
        case 'PublishedMonthly':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
        case 'Superseded':
          allowed.push('read');
          denied.push('write', 'annotate', 'derive', 'designate-report-candidate');
          break;
      }
      break;
  }

  // When hidden, all actions are denied
  if (hidden) {
    return {
      allowed: [],
      denied: [...FINANCIAL_ACCESS_ACTIONS],
      hidden: true,
    };
  }

  return { allowed, denied, hidden };
};

/**
 * Convenience: check if a specific action is allowed for a role+state combination.
 */
export const isFinancialActionAllowed = (
  query: IFinancialAccessQuery,
  action: FinancialAccessAction,
): boolean => {
  const result = resolveFinancialVersionAccess(query);
  return result.allowed.includes(action);
};
