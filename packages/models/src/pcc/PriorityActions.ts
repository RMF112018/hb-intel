/**
 * PCC priority action read-model types.
 *
 * The priority actions rail (contract §7) surfaces top actions across modules.
 * These types describe the read-model shape only — no scoring, ranking, or
 * generation logic is implied.
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccWorkCenterId } from './PccWorkCenters.js';
import type { PccWorkflowItemId } from './types.js';
import type { SiteHealthSeverity } from './SiteHealth.js';

export const PRIORITY_ACTION_CATEGORIES = [
  'workflow',
  'approval',
  'compliance',
  'inspection',
  'permit',
  'closeout',
  'health',
  'procore-sync',
  'documents',
  'safety',
] as const;

export type PriorityActionCategory = (typeof PRIORITY_ACTION_CATEGORIES)[number];

export const PRIORITY_ACTION_CATEGORY_LABELS: Record<PriorityActionCategory, string> = {
  'workflow': 'Workflow',
  'approval': 'Approval',
  'compliance': 'Compliance',
  'inspection': 'Inspection',
  'permit': 'Permit',
  'closeout': 'Closeout',
  'health': 'Site Health',
  'procore-sync': 'Procore Sync',
  'documents': 'Documents',
  'safety': 'Safety',
};

export interface IPriorityAction {
  id: string;
  category: PriorityActionCategory;
  title: string;
  summary?: string;
  /** ISO 8601 due date when the action carries one. */
  dueDate?: string;
  assigneePersona?: PccPersona;
  relatedWorkCenter?: PccWorkCenterId;
  severity?: SiteHealthSeverity;
  relatedWorkflowItemId?: PccWorkflowItemId;
}
