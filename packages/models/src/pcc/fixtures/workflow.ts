/**
 * PCC fixture — sample workflow items, transitions, and assignments.
 *
 * Deterministic, non-secret. Phase 3 / Wave 1 / Prompt 06.
 */

import type {
  IWorkflowItem,
  IWorkflowItemAssignment,
  IWorkflowItemAssignmentHistoryEntry,
  IWorkflowItemTransition,
} from '../WorkflowItems.js';
import type {
  PccUserId,
  PccWorkflowItemId,
} from '../types.js';

const PM_UPN = 'pm-sample@example.com';
const SUPER_UPN = 'super-sample@example.com';
const PE_UPN = 'pe-sample@example.com';

export const SAMPLE_WORKFLOW_ITEMS: readonly IWorkflowItem[] = [
  {
    id: 'fixture-wi-001' as PccWorkflowItemId,
    moduleId: 'startup-tasks',
    title: 'Mobilize site office',
    status: 'in-progress',
    assignedTo: PM_UPN as unknown as PccUserId,
    dueDate: '2026-05-10',
    createdAt: '2026-04-20T12:00:00Z',
    updatedAt: '2026-04-25T08:30:00Z',
    lastActorPersona: 'project-manager',
  },
  {
    id: 'fixture-wi-002' as PccWorkflowItemId,
    moduleId: 'permits',
    title: 'Submit master permit application',
    status: 'pending-review',
    assignedTo: PM_UPN as unknown as PccUserId,
    dueDate: '2026-04-30',
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-26T14:00:00Z',
    lastActorPersona: 'project-manager',
  },
  {
    id: 'fixture-wi-003' as PccWorkflowItemId,
    moduleId: 'required-inspections',
    title: 'Foundation pour inspection',
    status: 'not-started',
    createdAt: '2026-04-26T10:00:00Z',
    updatedAt: '2026-04-26T10:00:00Z',
  },
];

export const SAMPLE_WORKFLOW_ITEM_ASSIGNMENTS: readonly IWorkflowItemAssignment[] = [
  {
    itemId: 'fixture-wi-001' as PccWorkflowItemId,
    assignedToUpn: PM_UPN,
    assignedAtUtc: '2026-04-20T12:00:00Z',
    assignedByUpn: PE_UPN,
    dueDateUtc: '2026-05-10T17:00:00Z',
    assignmentNote: 'PM owns mobilization through preconstruction handoff.',
  },
];

export const SAMPLE_WORKFLOW_ITEM_ASSIGNMENT_HISTORY: readonly IWorkflowItemAssignmentHistoryEntry[] = [
  {
    id: 'fixture-ah-001',
    itemId: 'fixture-wi-001' as PccWorkflowItemId,
    assignedToUpn: SUPER_UPN,
    assignedByUpn: PM_UPN,
    assignedAtUtc: '2026-04-10T12:00:00Z',
    unassignedAtUtc: '2026-04-20T12:00:00Z',
    note: 'Initial superintendent placeholder; reassigned to PM at kickoff.',
  },
];

export const SAMPLE_WORKFLOW_ITEM_TRANSITIONS: readonly IWorkflowItemTransition[] = [
  {
    id: 'fixture-wt-001',
    workflowItemId: 'fixture-wi-001' as PccWorkflowItemId,
    fromStatus: 'not-started',
    toStatus: 'in-progress',
    actorUpn: PM_UPN,
    actorPersona: 'project-manager',
    reason: 'PM accepted mobilization assignment.',
    occurredAtUtc: '2026-04-20T12:30:00Z',
    correlationId: 'fixture-corr-001',
  },
  {
    id: 'fixture-wt-002',
    workflowItemId: 'fixture-wi-002' as PccWorkflowItemId,
    fromStatus: 'in-progress',
    toStatus: 'pending-review',
    actorUpn: PM_UPN,
    actorPersona: 'project-manager',
    reason: 'Permit application submitted; awaiting AHJ review.',
    occurredAtUtc: '2026-04-26T14:00:00Z',
    correlationId: 'fixture-corr-002',
  },
];
