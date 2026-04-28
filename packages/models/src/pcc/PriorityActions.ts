/**
 * PCC priority action read-model types.
 *
 * The priority actions rail (contract §7) surfaces top actions across modules.
 * These types describe the read-model shape only — no scoring, ranking, or
 * generation logic is implied.
 *
 * Phase 3 / Wave 1 / Prompt 03 adds a category-display meta registry next to
 * the existing label map.
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

export interface IPriorityActionCategoryMeta {
  id: PriorityActionCategory;
  displayName: string;
  description: string;
  mvpTier: 'MVP' | 'Later';
}

export const PRIORITY_ACTION_CATEGORY_META: Readonly<
  Record<PriorityActionCategory, IPriorityActionCategoryMeta>
> = {
  'workflow': {
    id: 'workflow',
    displayName: 'Workflow',
    description: 'Open workflow items requiring attention.',
    mvpTier: 'MVP',
  },
  'approval': {
    id: 'approval',
    displayName: 'Approval',
    description: 'Approval checkpoints awaiting decision.',
    mvpTier: 'MVP',
  },
  'compliance': {
    id: 'compliance',
    displayName: 'Compliance',
    description: 'Contract or regulatory obligations needing follow-up.',
    mvpTier: 'Later',
  },
  'inspection': {
    id: 'inspection',
    displayName: 'Inspection',
    description: 'Required inspections that are due, failed, or unscheduled.',
    mvpTier: 'MVP',
  },
  'permit': {
    id: 'permit',
    displayName: 'Permit',
    description: 'Permit items needing action or expiring soon.',
    mvpTier: 'MVP',
  },
  'closeout': {
    id: 'closeout',
    displayName: 'Closeout',
    description: 'Closeout deliverables and warranty handoff items.',
    mvpTier: 'MVP',
  },
  'health': {
    id: 'health',
    displayName: 'Site Health',
    description: 'Drift findings or repair acknowledgements awaiting action.',
    mvpTier: 'MVP',
  },
  'procore-sync': {
    id: 'procore-sync',
    displayName: 'Procore Sync',
    description: 'Procore mapping or sync health items requiring attention.',
    mvpTier: 'Later',
  },
  'documents': {
    id: 'documents',
    displayName: 'Documents',
    description: 'Document register items needing review or upload.',
    mvpTier: 'Later',
  },
  'safety': {
    id: 'safety',
    displayName: 'Safety',
    description: 'Safety acknowledgements, deficiencies, or open incidents.',
    mvpTier: 'Later',
  },
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
