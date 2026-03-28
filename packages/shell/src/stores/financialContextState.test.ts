import { describe, expect, it, beforeEach } from 'vitest';
import {
  getFinancialContext,
  saveFinancialContext,
  clearFinancialContext,
  getFinancialReturnTool,
} from './financialContextState.js';

describe('financialContextState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── Read / Write ────────────────────────────────────────────────────

  it('returns null when no context is saved', () => {
    expect(getFinancialContext('proj-001')).toBeNull();
  });

  it('saves and retrieves Financial context for a project', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget', reportingPeriod: '2026-03' });

    const ctx = getFinancialContext('proj-001');
    expect(ctx).not.toBeNull();
    expect(ctx!.projectId).toBe('proj-001');
    expect(ctx!.lastTool).toBe('budget');
    expect(ctx!.reportingPeriod).toBe('2026-03');
    expect(ctx!.activeVersionId).toBeNull();
    expect(ctx!.selectedArtifactId).toBeNull();
  });

  it('merges partial updates into existing context', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget', reportingPeriod: '2026-03' });
    saveFinancialContext('proj-001', { lastTool: 'forecast' });

    const ctx = getFinancialContext('proj-001');
    expect(ctx!.lastTool).toBe('forecast');
    expect(ctx!.reportingPeriod).toBe('2026-03'); // preserved from first save
  });

  // ── Project isolation ───────────────────────────────────────────────

  it('isolates context per project — no cross-project leakage', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget' });
    saveFinancialContext('proj-002', { lastTool: 'buyout' });

    expect(getFinancialContext('proj-001')!.lastTool).toBe('budget');
    expect(getFinancialContext('proj-002')!.lastTool).toBe('buyout');
  });

  it('returns null for a project with no saved context', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget' });
    expect(getFinancialContext('proj-002')).toBeNull();
  });

  // ── Clear ───────────────────────────────────────────────────────────

  it('clears context for a specific project without affecting others', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget' });
    saveFinancialContext('proj-002', { lastTool: 'buyout' });

    clearFinancialContext('proj-001');

    expect(getFinancialContext('proj-001')).toBeNull();
    expect(getFinancialContext('proj-002')!.lastTool).toBe('buyout');
  });

  // ── Return-tool memory ──────────────────────────────────────────────

  it('returns the last-visited tool for return-memory', () => {
    saveFinancialContext('proj-001', { lastTool: 'cash-flow' });
    expect(getFinancialReturnTool('proj-001')).toBe('cash-flow');
  });

  it('returns null when no return-tool is saved', () => {
    expect(getFinancialReturnTool('proj-001')).toBeNull();
  });

  it('updates return-tool when navigating to a new tool', () => {
    saveFinancialContext('proj-001', { lastTool: 'budget' });
    saveFinancialContext('proj-001', { lastTool: 'forecast' });
    expect(getFinancialReturnTool('proj-001')).toBe('forecast');
  });

  // ── Versioning context ──────────────────────────────────────────────

  it('preserves version and artifact context', () => {
    saveFinancialContext('proj-001', {
      activeVersionId: 'ver-abc',
      selectedArtifactId: 'art-123',
    });

    const ctx = getFinancialContext('proj-001');
    expect(ctx!.activeVersionId).toBe('ver-abc');
    expect(ctx!.selectedArtifactId).toBe('art-123');
  });

  it('clears version context independently', () => {
    saveFinancialContext('proj-001', {
      lastTool: 'forecast',
      activeVersionId: 'ver-abc',
    });
    saveFinancialContext('proj-001', { activeVersionId: null });

    const ctx = getFinancialContext('proj-001');
    expect(ctx!.lastTool).toBe('forecast'); // preserved
    expect(ctx!.activeVersionId).toBeNull(); // cleared
  });

  // ── Malformed data resilience ───────────────────────────────────────

  it('handles malformed localStorage data gracefully', () => {
    localStorage.setItem('hbc-financial-ctx-proj-001', 'not-json');
    expect(getFinancialContext('proj-001')).toBeNull();
  });

  it('rejects context with mismatched projectId', () => {
    localStorage.setItem(
      'hbc-financial-ctx-proj-001',
      JSON.stringify({ projectId: 'proj-002', lastTool: 'budget' }),
    );
    expect(getFinancialContext('proj-001')).toBeNull();
  });
});
