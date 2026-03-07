import { describe, expect, it } from 'vitest';
import {
  BALANCED_STARTUP_BUDGETS,
  clear,
  getSnapshot,
  recordPhase,
  setBudgets,
  validateBudgets,
} from './startupTiming.js';
import type { StartupBudgetDefinition } from './types.js';

describe('startupTiming', () => {
  it('records startup phases and returns deterministic snapshot shape', () => {
    clear();
    recordPhase('runtime-detection', 40, { source: 'test', outcome: 'success' });
    recordPhase('auth-bootstrap', 200, { source: 'test', outcome: 'success' });
    recordPhase('session-restore', 100, { source: 'test', outcome: 'success' });
    recordPhase('permission-resolution', 50, { source: 'test', outcome: 'success' });
    recordPhase('first-protected-shell-render', 900, { source: 'test', outcome: 'success' });

    const snapshot = getSnapshot();
    expect(snapshot.records).toHaveLength(5);
    expect(snapshot.validation.ok).toBe(true);
    expect(snapshot.budgets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'runtime-detection',
          budgetMs: BALANCED_STARTUP_BUDGETS['runtime-detection'],
        }),
      ]),
    );
  });

  it('reports budget failures without throwing (non-blocking enforcement)', () => {
    clear();
    recordPhase('runtime-detection', 250, { source: 'test', outcome: 'success' });
    const validation = validateBudgets();
    expect(validation.ok).toBe(false);
    expect(validation.failures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: 'runtime-detection',
          reason: 'exceeded-budget',
        }),
      ]),
    );
  });

  it('supports budget override and reset workflows for preview validation', () => {
    clear();
    const budgets: StartupBudgetDefinition[] = [
      { phase: 'runtime-detection', budgetMs: 300 },
      { phase: 'auth-bootstrap', budgetMs: 900 },
      { phase: 'session-restore', budgetMs: 600 },
      { phase: 'permission-resolution', budgetMs: 250 },
      { phase: 'first-protected-shell-render', budgetMs: 1800 },
    ];
    setBudgets(budgets);
    recordPhase('runtime-detection', 250, { source: 'test', outcome: 'success' });
    expect(validateBudgets().failures.some((failure) => failure.phase === 'runtime-detection')).toBe(false);

    setBudgets([]);
    clear();
    recordPhase('runtime-detection', 250, { source: 'test', outcome: 'success' });
    expect(validateBudgets().failures.some((failure) => failure.phase === 'runtime-detection')).toBe(true);
  });
});
