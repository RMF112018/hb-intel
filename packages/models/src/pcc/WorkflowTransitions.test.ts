import { describe, it, expect } from 'vitest';
import {
  WORKFLOW_ITEM_STATUSES,
  type IWorkflowItemTransition,
  type IWorkflowItemAssignmentHistoryEntry,
} from './WorkflowItems.js';
import type { PccWorkflowItemId } from './types.js';

const itemId = 'wi-001' as PccWorkflowItemId;

describe('PCC workflow transitions', () => {
  it('IWorkflowItemTransition fromStatus and toStatus are constrained to WORKFLOW_ITEM_STATUSES', () => {
    const sample: IWorkflowItemTransition = {
      id: 't-1',
      workflowItemId: itemId,
      fromStatus: 'in-progress',
      toStatus: 'pending-review',
      actorUpn: 'pm@example.com',
      actorPersona: 'project-manager',
      occurredAtUtc: '2026-04-28T12:00:00Z',
      correlationId: 'corr-1',
    };
    expect(WORKFLOW_ITEM_STATUSES).toContain(sample.fromStatus);
    expect(WORKFLOW_ITEM_STATUSES).toContain(sample.toStatus);
    expect(sample.id.length).toBeGreaterThan(0);
    expect(sample.correlationId.length).toBeGreaterThan(0);
  });

  it('IWorkflowItemAssignmentHistoryEntry locks the assignment lifecycle shape', () => {
    const sample: IWorkflowItemAssignmentHistoryEntry = {
      id: 'ah-1',
      itemId,
      assignedToUpn: 'super@example.com',
      assignedByUpn: 'pm@example.com',
      assignedAtUtc: '2026-04-28T12:00:00Z',
      unassignedAtUtc: '2026-05-01T12:00:00Z',
      dueDateUtc: '2026-05-30T12:00:00Z',
      note: 'reassigned during PTO',
    };
    expect(sample.id.length).toBeGreaterThan(0);
    expect(sample.itemId).toBe(itemId);
    expect(sample.unassignedAtUtc).toBeDefined();
  });
});
