import { describe, it, expect } from 'vitest';
import {
  getActionDescriptor,
  getAllActionDescriptors,
  getImplementNowActions,
  resolveRoutingDecision,
  buildAuditPayload,
} from './hybrid-identity-workflow-router.js';

describe('getActionDescriptor', () => {
  it('returns descriptor for known action', () => {
    const desc = getActionDescriptor('user:search');
    expect(desc).not.toBeNull();
    expect(desc!.domain).toBe('user');
    expect(desc!.riskTier).toBe('routine');
  });

  it('returns null for unknown action', () => {
    expect(getActionDescriptor('unknown:action' as never)).toBeNull();
  });
});

describe('getAllActionDescriptors', () => {
  it('returns all 30 cataloged actions', () => {
    const all = getAllActionDescriptors();
    expect(all.length).toBe(30);
  });

  it('every descriptor has required fields', () => {
    for (const d of getAllActionDescriptors()) {
      expect(d.id).toBeTruthy();
      expect(d.domain).toBeTruthy();
      expect(d.label).toBeTruthy();
      expect(d.riskTier).toBeTruthy();
      expect(d.auditLevel).toBeTruthy();
      expect(d.phaseDisposition).toBeTruthy();
    }
  });
});

describe('getImplementNowActions', () => {
  it('returns only implement-now actions', () => {
    const actions = getImplementNowActions();
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      expect(a.phaseDisposition).toBe('implement-now');
    }
  });
});

describe('resolveRoutingDecision', () => {
  it('resolves AD DS user create with ad-ds connector', () => {
    const decision = resolveRoutingDecision('user:create-adds');
    expect(decision).not.toBeNull();
    expect(decision!.resolvedAuthority).toBe('ad-ds');
    expect(decision!.executionBoundary).toBe('ad-ds');
    expect(decision!.requiredConnectors).toContain('ad-ds');
    expect(decision!.riskTier).toBe('elevated');
  });

  it('resolves cloud user search with graph connector', () => {
    const decision = resolveRoutingDecision('user:search');
    expect(decision).not.toBeNull();
    expect(decision!.resolvedAuthority).toBe('entra');
    expect(decision!.executionBoundary).toBe('graph');
    expect(decision!.requiredConnectors).toContain('graph-identity');
  });

  it('resolves destructive action with confirmation preflight', () => {
    const decision = resolveRoutingDecision('user:delete-adds');
    expect(decision).not.toBeNull();
    expect(decision!.riskTier).toBe('destructive');
    expect(decision!.checkpoint).toBe('double-confirmation');
    expect(decision!.preflightChecks).toContain('confirmation-token:required');
  });

  it('resolves coordinated action with graph connector', () => {
    const decision = resolveRoutingDecision('access:grant-rollout');
    expect(decision).not.toBeNull();
    expect(decision!.resolvedAuthority).toBe('coordinated');
    expect(decision!.executionBoundary).toBe('authority-routed');
  });

  it('returns null for unknown action', () => {
    expect(resolveRoutingDecision('unknown:action' as never)).toBeNull();
  });
});

describe('buildAuditPayload', () => {
  it('builds a complete audit payload', () => {
    const payload = buildAuditPayload({
      actionId: 'user:disable-adds',
      actor: { upn: 'admin@hb.com', oid: '123', displayName: 'Admin' },
      target: { objectType: 'user', identifier: 'CN=Jane,OU=Users,DC=corp', displayName: 'Jane Doe' },
      correlationId: 'corr-001',
      success: true,
      connectorUsed: 'ad-ds',
    });

    expect(payload.actionId).toBe('user:disable-adds');
    expect(payload.domain).toBe('user');
    expect(payload.sourceOfAuthority).toBe('ad-ds');
    expect(payload.riskTier).toBe('elevated');
    expect(payload.executionBoundary).toBe('ad-ds');
    expect(payload.connectorUsed).toBe('ad-ds');
    expect(payload.success).toBe(true);
    expect(payload.errorCode).toBeNull();
    expect(payload.timestamp).toBeTruthy();
  });

  it('includes error details on failure', () => {
    const payload = buildAuditPayload({
      actionId: 'user:create-cloud',
      actor: { upn: 'admin@hb.com', oid: '123', displayName: 'Admin' },
      target: { objectType: 'user', identifier: 'new@hb.com', displayName: null },
      correlationId: 'corr-002',
      success: false,
      errorCode: 'GRAPH_PERMISSION_INSUFFICIENT',
      errorMessage: 'Missing User.ReadWrite.All',
    });

    expect(payload.success).toBe(false);
    expect(payload.errorCode).toBe('GRAPH_PERMISSION_INSUFFICIENT');
    expect(payload.errorMessage).toBe('Missing User.ReadWrite.All');
  });
});
