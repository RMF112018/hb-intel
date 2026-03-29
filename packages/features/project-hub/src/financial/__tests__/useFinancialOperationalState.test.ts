import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFinancialOperationalState } from '../hooks/useFinancialOperationalState.js';

describe('useFinancialOperationalState', () => {
  // ── Data source truthfulness ──────────────────────────────────────

  it('reports mock data source when no repository is wired', () => {
    const { result } = renderHook(() => useFinancialOperationalState());
    expect(result.current.isMockData).toBe(true);
    expect(result.current.dataSource).toBe('mock');
    expect(result.current.dataSourceLabel).toContain('Sample data');
  });

  // ── Editability by version state ──────────────────────────────────

  it('reports editable for Working version', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working' }),
    );
    expect(result.current.editability).toBe('editable');
    expect(result.current.editabilityLabel).toContain('PM can edit');
  });

  it('reports locked for ConfirmedInternal version', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'ConfirmedInternal' }),
    );
    expect(result.current.editability).toBe('locked');
    expect(result.current.editabilityLabel).toContain('immutable');
  });

  it('reports locked for PublishedMonthly version', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'PublishedMonthly' }),
    );
    expect(result.current.editability).toBe('locked');
  });

  it('reports read-only for Superseded version', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Superseded' }),
    );
    expect(result.current.editability).toBe('read-only');
    expect(result.current.editabilityLabel).toContain('historical');
  });

  // ── Blockers ──────────────────────────────────────────────────────

  it('reports stale budget blocker when staleBudgetLineCount > 0', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ staleBudgetLineCount: 3 }),
    );
    expect(result.current.blockers).toHaveLength(2); // stale + checklist
    expect(result.current.blockers[0].id).toBe('stale-budget');
    expect(result.current.blockers[0].label).toContain('3 unresolved');
    expect(result.current.blockers[0].severity).toBe('error');
  });

  it('reports checklist blocker when checklist is incomplete on Working', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', checklistComplete: false }),
    );
    const checklistBlocker = result.current.blockers.find((b) => b.id === 'checklist-incomplete');
    expect(checklistBlocker).toBeDefined();
    expect(checklistBlocker!.severity).toBe('warning');
  });

  it('reports no checklist blocker when checklist is complete', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', checklistComplete: true }),
    );
    const checklistBlocker = result.current.blockers.find((b) => b.id === 'checklist-incomplete');
    expect(checklistBlocker).toBeUndefined();
  });

  // ── Readiness ─────────────────────────────────────────────────────

  it('reports ready when Working + checklist complete + no stale lines', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', checklistComplete: true, staleBudgetLineCount: 0 }),
    );
    expect(result.current.readiness).toBe('ready');
    expect(result.current.readinessLabel).toContain('Ready to confirm');
  });

  it('reports blocked when there are blockers', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', staleBudgetLineCount: 2 }),
    );
    expect(result.current.readiness).toBe('blocked');
  });

  it('reports ready for report candidate', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'ConfirmedInternal', isReportCandidate: true }),
    );
    expect(result.current.readiness).toBe('ready');
    expect(result.current.readinessLabel).toContain('eligible for publication');
  });

  // ── Next action ───────────────────────────────────────────────────

  it('suggests resolving blockers when blockers exist', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', staleBudgetLineCount: 1 }),
    );
    expect(result.current.nextAction).not.toBeNull();
    expect(result.current.nextAction!.isBlocked).toBe(true);
    expect(result.current.nextAction!.ownerRole).toBe('PM');
  });

  it('suggests confirming when ready', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'Working', checklistComplete: true, staleBudgetLineCount: 0 }),
    );
    expect(result.current.nextAction).not.toBeNull();
    expect(result.current.nextAction!.label).toContain('Confirm');
    expect(result.current.nextAction!.isBlocked).toBe(false);
  });

  it('suggests designating candidate when confirmed but not candidate', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'ConfirmedInternal', isReportCandidate: false }),
    );
    expect(result.current.nextAction).not.toBeNull();
    expect(result.current.nextAction!.label).toContain('report candidate');
  });

  it('shows system awaiting publication for report candidate', () => {
    const { result } = renderHook(() =>
      useFinancialOperationalState({ versionState: 'ConfirmedInternal', isReportCandidate: true }),
    );
    expect(result.current.nextAction).not.toBeNull();
    expect(result.current.nextAction!.ownerRole).toBe('System');
    expect(result.current.nextAction!.label).toContain('publication');
  });
});
