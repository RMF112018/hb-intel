/**
 * PCC workflow item types.
 *
 * Wave 1 read-model types for items that flow through PCC modules. No
 * persistence, transition-engine, validation, or notification behavior is
 * implied.
 *
 * Phase 3 / Wave 1 / Prompt 03 adds a status-display registry alongside the
 * existing `WORKFLOW_ITEM_STATUSES` value array.
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PccUserId, PccWorkflowItemId } from './types.js';
import type { WorkflowModuleId } from './WorkflowModules.js';

export const WORKFLOW_ITEM_STATUSES = [
  'not-started',
  'in-progress',
  'pending-review',
  'approved',
  'rejected',
  'complete',
  'archived',
] as const;

export type WorkflowItemStatus = (typeof WORKFLOW_ITEM_STATUSES)[number];

export interface IWorkflowItem {
  id: PccWorkflowItemId;
  moduleId: WorkflowModuleId;
  title: string;
  status: WorkflowItemStatus;
  assignedTo?: PccUserId;
  /** ISO 8601 due date. */
  dueDate?: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string;
  lastActorPersona?: PccPersona;
}

export interface IWorkflowItemAssignment {
  itemId: PccWorkflowItemId;
  assignedToUpn: string;
  /** ISO 8601 UTC. */
  assignedAtUtc: string;
  assignedByUpn: string;
  /** ISO 8601 UTC. */
  dueDateUtc?: string;
  assignmentNote?: string;
}

export interface IWorkflowStatusMeta {
  id: WorkflowItemStatus;
  displayName: string;
  description: string;
  /** True when reaching this status closes the item from active workflow. */
  isTerminal: boolean;
}

export const WORKFLOW_STATUS_META: Readonly<Record<WorkflowItemStatus, IWorkflowStatusMeta>> = {
  'not-started': {
    id: 'not-started',
    displayName: 'Not Started',
    description: 'Item has been created but no work has begun.',
    isTerminal: false,
  },
  'in-progress': {
    id: 'in-progress',
    displayName: 'In Progress',
    description: 'Item is actively being worked.',
    isTerminal: false,
  },
  'pending-review': {
    id: 'pending-review',
    displayName: 'Pending Review',
    description: 'Item is awaiting reviewer decision.',
    isTerminal: false,
  },
  'approved': {
    id: 'approved',
    displayName: 'Approved',
    description: 'Item has been approved by the required reviewer.',
    isTerminal: false,
  },
  'rejected': {
    id: 'rejected',
    displayName: 'Rejected',
    description: 'Item was rejected by the reviewer; not eligible for further action without rework.',
    isTerminal: true,
  },
  'complete': {
    id: 'complete',
    displayName: 'Complete',
    description: 'Item is finished and recorded.',
    isTerminal: true,
  },
  'archived': {
    id: 'archived',
    displayName: 'Archived',
    description: 'Item has been archived and is no longer surfaced in active views.',
    isTerminal: true,
  },
};
