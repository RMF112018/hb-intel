import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFinancialSessionHistory } from '../hooks/useFinancialSessionHistory.js';

describe('useFinancialSessionHistory', () => {
  it('returns session history with mock data', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    expect(result.current.sessions.length).toBeGreaterThan(0);
  });

  it('identifies failed sessions', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    expect(result.current.hasFailedSessions).toBe(true);
    const failed = result.current.sessions.find((s) => s.status === 'failed');
    expect(failed).toBeDefined();
    expect(failed!.type).toBe('version-confirmation');
  });

  it('identifies partial sessions with unresolved items', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    expect(result.current.hasPartialSessions).toBe(true);
    const partial = result.current.sessions.find((s) => s.status === 'partial');
    expect(partial).toBeDefined();
    expect(partial!.unresolvedCount).toBeGreaterThan(0);
  });

  it('provides recovery path for partial sessions', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    const partial = result.current.sessions.find((s) => s.status === 'partial');
    expect(partial!.recoveryPath).not.toBeNull();
    expect(partial!.recoveryPath!.toolSlug).toBe('budget');
    expect(partial!.recoveryPath!.isDestructive).toBe(false);
  });

  it('provides recovery path for failed sessions', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    const failed = result.current.sessions.find((s) => s.status === 'failed');
    expect(failed!.recoveryPath).not.toBeNull();
    expect(failed!.recoveryPath!.toolSlug).toBe('checklist');
  });

  it('complete sessions have no recovery path', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    const complete = result.current.sessions.find((s) => s.status === 'complete');
    expect(complete!.recoveryPath).toBeNull();
  });

  it('provides reconciliation outcome with pending resolution count', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    expect(result.current.reconciliation).not.toBeNull();
    expect(result.current.reconciliation!.pendingResolution).toBe(2);
    expect(result.current.hasPendingReconciliation).toBe(true);
  });

  it('provides revision lineage with derivation chain', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    expect(result.current.revisionLineage.length).toBe(3);

    const v1 = result.current.revisionLineage.find((v) => v.versionNumber === 1);
    expect(v1!.derivedFrom).toBeNull(); // Initial version
    expect(v1!.state).toBe('PublishedMonthly');

    const v3 = result.current.revisionLineage.find((v) => v.versionNumber === 3);
    expect(v3!.derivedFrom).toBe(2);
    expect(v3!.derivationReason).toBe('NewPeriod');
    expect(v3!.isCurrent).toBe(true);
  });

  it('reconciliation tracks matched, created, and ambiguous outcomes', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    const recon = result.current.reconciliation!;
    expect(recon.matched).toBe(138);
    expect(recon.created).toBe(3);
    expect(recon.ambiguous).toBe(4);
    expect(recon.resolved).toBe(2);
    expect(recon.dismissed).toBe(0);
  });

  it('session records include actor and timing', () => {
    const { result } = renderHook(() => useFinancialSessionHistory());
    const session = result.current.sessions[0];
    expect(session.actor).toBeTruthy();
    expect(session.startedAt).toBeTruthy();
    expect(session.affectedRecordCount).toBeGreaterThan(0);
  });
});
