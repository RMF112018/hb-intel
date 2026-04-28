/**
 * PCC fixture — sample business audit events.
 *
 * Deterministic, non-secret. Covers both `BusinessAuditSourceContext` branches.
 * Phase 3 / Wave 1 / Prompt 06.
 */

import type { IBusinessAuditEvent } from '../BusinessAuditEvent.js';
import type {
  PccBusinessAuditEventId,
  PccProjectId,
} from '../types.js';

const projectId = 'fixture-pcc-project-001' as PccProjectId;

export const SAMPLE_BUSINESS_AUDIT_EVENTS: readonly IBusinessAuditEvent[] = [
  {
    id: 'fixture-evt-001' as PccBusinessAuditEventId,
    eventType: 'workflow.item.transitioned',
    subjectType: 'WorkflowItem',
    subjectId: 'fixture-wi-001',
    actorUpn: 'pm-sample@example.com',
    actorPersona: 'project-manager',
    occurredAtUtc: '2026-04-20T12:30:00Z',
    correlationId: 'fixture-corr-001',
    projectId,
    sourceContext: { type: 'workflow-module', id: 'startup-tasks' },
    payloadSummary: 'Mobilize site office moved to in-progress.',
    beforeSummary: 'not-started',
    afterSummary: 'in-progress',
  },
  {
    id: 'fixture-evt-002' as PccBusinessAuditEventId,
    eventType: 'approval.checkpoint.decided',
    subjectType: 'ApprovalCheckpoint',
    subjectId: 'fixture-cp-002',
    actorUpn: 'admin-sample@example.com',
    actorPersona: 'pcc-admin',
    occurredAtUtc: '2026-04-26T10:15:00Z',
    correlationId: 'fixture-corr-003',
    projectId,
    sourceContext: { type: 'mvp-surface', id: 'approvals' },
    severity: 'Info',
    payloadSummary: 'Permit issuance checkpoint approved.',
    beforeSummary: 'pending',
    afterSummary: 'approved',
  },
];
