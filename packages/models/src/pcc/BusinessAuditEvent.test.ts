import { describe, it, expect } from 'vitest';
import {
  BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES,
  type IBusinessAuditEvent,
  type BusinessAuditSourceContext,
} from './BusinessAuditEvent.js';
import type { PccBusinessAuditEventId, PccProjectId } from './types.js';

const eventId = 'evt-001' as PccBusinessAuditEventId;
const projectId = 'proj-001' as PccProjectId;

describe('PCC business audit events', () => {
  it('BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES locks the discriminator literal set', () => {
    expect([...BUSINESS_AUDIT_SOURCE_CONTEXT_TYPES]).toEqual(['workflow-module', 'mvp-surface']);
  });

  it('Prompt 02 minimal shape is still accepted (backward compat)', () => {
    const minimal: IBusinessAuditEvent = {
      id: eventId,
      eventType: 'item.transitioned',
      subjectType: 'WorkflowItem',
      subjectId: 'wi-1',
      actorUpn: 'pm@example.com',
      occurredAtUtc: '2026-04-28T12:00:00Z',
      correlationId: 'corr-1',
    };
    expect(minimal.id).toBe(eventId);
    expect(minimal.eventType).toBe('item.transitioned');
    expect(minimal.subjectType).toBe('WorkflowItem');
  });

  it('sourceContext narrows on type for workflow-module branch', () => {
    const ctx: BusinessAuditSourceContext = {
      type: 'workflow-module',
      id: 'startup-tasks',
    };
    expect(ctx.type).toBe('workflow-module');
    if (ctx.type === 'workflow-module') {
      expect(ctx.id).toBe('startup-tasks');
    }
  });

  it('sourceContext narrows on type for mvp-surface branch', () => {
    const ctx: BusinessAuditSourceContext = {
      type: 'mvp-surface',
      id: 'project-readiness',
    };
    expect(ctx.type).toBe('mvp-surface');
    if (ctx.type === 'mvp-surface') {
      expect(ctx.id).toBe('project-readiness');
    }
  });

  it('extended event accepts projectId, sourceContext, before/after summary', () => {
    const event: IBusinessAuditEvent = {
      id: eventId,
      eventType: 'approval.decided',
      subjectType: 'ApprovalCheckpoint',
      subjectId: 'cp-1',
      actorUpn: 'pe@example.com',
      actorPersona: 'project-executive',
      occurredAtUtc: '2026-04-28T12:00:00Z',
      correlationId: 'corr-1',
      projectId,
      sourceContext: { type: 'mvp-surface', id: 'approvals' },
      beforeSummary: 'pending',
      afterSummary: 'approved',
    };
    expect(event.projectId).toBe(projectId);
    expect(event.sourceContext?.type).toBe('mvp-surface');
    expect(event.beforeSummary).toBe('pending');
    expect(event.afterSummary).toBe('approved');
  });
});
