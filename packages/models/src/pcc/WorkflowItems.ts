/**
 * PCC workflow item types.
 *
 * Wave 1 read-model types for items that flow through PCC modules. No
 * persistence, transition-engine, validation, or notification behavior is
 * implied.
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
