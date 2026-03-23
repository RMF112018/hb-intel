import type {
  FinancialAccessAction,
  IConfirmationGateResult,
  IFinancialAccessQuery,
  IFinancialAccessResult,
  IForecastChecklistItem,
  IForecastChecklistTemplateEntry,
  IForecastVersion,
} from '../types/index.js';
import { FINANCIAL_ACCESS_ACTIONS, FORECAST_CHECKLIST_TEMPLATE } from '../constants/index.js';

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

// ── T03: Confirmation Gate and Checklist ──────────────────────────────

/**
 * Validate whether a working version can be confirmed (T03 §4.3).
 * Returns a gate result with blockers list if confirmation is not allowed.
 */
export const validateConfirmationGate = (
  version: IForecastVersion,
  checklist: readonly IForecastChecklistItem[],
  staleBudgetLineCount: number,
): IConfirmationGateResult => {
  const blockers: string[] = [];

  // Version must be Working
  if (version.versionType !== 'Working') {
    blockers.push(`Version is ${version.versionType}, not Working`);
  }

  // All required checklist items must be completed
  const requiredItems = checklist.filter((item) => item.required);
  const incompleteRequired = requiredItems.filter((item) => !item.completed);
  if (incompleteRequired.length > 0) {
    blockers.push(
      `${incompleteRequired.length} required checklist item(s) incomplete: ${incompleteRequired.map((i) => i.itemId).join(', ')}`,
    );
  }

  // No unresolved reconciliation conditions
  if (staleBudgetLineCount > 0) {
    blockers.push(
      `${staleBudgetLineCount} budget line(s) with unresolved reconciliation conditions`,
    );
  }

  return { canConfirm: blockers.length === 0, blockers };
};

/**
 * Generate a new checklist instance for a forecast version from the canonical template (T03 §4.1).
 * All items start uncompleted.
 */
export const generateChecklistForVersion = (
  forecastVersionId: string,
): IForecastChecklistItem[] =>
  FORECAST_CHECKLIST_TEMPLATE.map((entry: IForecastChecklistTemplateEntry) => ({
    checklistId: crypto.randomUUID(),
    forecastVersionId,
    itemId: entry.itemId,
    group: entry.group,
    label: entry.label,
    completed: false,
    completedBy: null,
    completedAt: null,
    notes: null,
    required: entry.required,
  }));
