import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerBicModule,
  getRegistry,
  getModuleRegistration,
  executeBicFanOut,
  executeServerAggregation,
  _clearRegistryForTests,
} from '../registry/BicModuleRegistry';
import { mockBicStates } from '@hbc/bic-next-move/testing';

beforeEach(() => _clearRegistryForTests());
afterEach(() => _clearRegistryForTests());

describe('registerBicModule (D-02)', () => {
  it('adds module to registry', () => {
    registerBicModule({ key: 'bd-scorecard', label: 'Test', queryFn: async () => [] });
    expect(getRegistry().has('bd-scorecard')).toBe(true);
  });

  it('ignores duplicate registration', () => {
    registerBicModule({ key: 'bd-scorecard', label: 'Test', queryFn: async () => [] });
    registerBicModule({ key: 'bd-scorecard', label: 'Test 2', queryFn: async () => [] });
    expect(getRegistry().get('bd-scorecard')?.label).toBe('Test');
  });
});

describe('getModuleRegistration', () => {
  it('returns registration for known key', () => {
    registerBicModule({ key: 'bd-scorecard', label: 'Scorecards', queryFn: async () => [] });
    const reg = getModuleRegistration('bd-scorecard');
    expect(reg?.label).toBe('Scorecards');
  });

  it('returns undefined for unknown key', () => {
    expect(getModuleRegistration('nonexistent')).toBeUndefined();
  });
});

describe('executeServerAggregation', () => {
  it('throws not-implemented error', async () => {
    await expect(executeServerAggregation('user-123')).rejects.toThrow(
      /server aggregation mode is not yet implemented/i
    );
  });
});

describe('manifest guard (D-02)', () => {
  it('warns about unregistered manifest keys after delay', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Register one key — all others in manifest should trigger warning
    registerBicModule({ key: 'bd-scorecard', label: 'Test', queryFn: async () => [] });

    // Fast-forward past manifest guard delay (5000ms)
    vi.advanceTimersByTime(6000);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('has not registered within')
    );

    warnSpy.mockRestore();
    vi.useRealTimers();
  });

  it('warns about unknown registered keys', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerBicModule({ key: 'unknown-module-xyz', label: 'Test', queryFn: async () => [] });

    vi.advanceTimersByTime(6000);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unknown key "unknown-module-xyz"')
    );

    warnSpy.mockRestore();
    vi.useRealTimers();
  });
});

describe('executeBicFanOut (D-06)', () => {
  it('merges items from all registered modules', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'bd-scorecard::001', moduleKey: 'bd-scorecard', moduleLabel: 'Scorecards',
          state: mockBicStates.upcoming, href: '/bd/scorecards/001', title: 'Test Scorecard' },
      ],
    });
    registerBicModule({
      key: 'estimating-pursuit',
      label: 'Pursuits',
      queryFn: async () => [
        { itemKey: 'estimating-pursuit::001', moduleKey: 'estimating-pursuit', moduleLabel: 'Pursuits',
          state: mockBicStates.watch, href: '/estimating/001', title: 'Test Pursuit' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items).toHaveLength(2);
    expect(result.failedModules).toHaveLength(0);
  });

  it('reports failed modules without failing the entire call', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => { throw new Error('Network error'); },
    });
    registerBicModule({
      key: 'estimating-pursuit',
      label: 'Pursuits',
      queryFn: async () => [],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.failedModules).toContain('bd-scorecard');
    expect(result.items).toHaveLength(0); // Pursuits returned empty, Scorecards failed
  });

  it('sorts items: immediate → watch → upcoming', async () => {
    registerBicModule({
      key: 'bd-scorecard',
      label: 'Scorecards',
      queryFn: async () => [
        { itemKey: 'a', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.upcoming, href: '/a', title: 'A' },
        { itemKey: 'b', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.immediate, href: '/b', title: 'B' },
        { itemKey: 'c', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: mockBicStates.watch, href: '/c', title: 'C' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items[0].state.urgencyTier).toBe('immediate');
    expect(result.items[1].state.urgencyTier).toBe('watch');
    expect(result.items[2].state.urgencyTier).toBe('upcoming');
  });

  it('returns empty items and failedModules when no modules registered', async () => {
    const result = await executeBicFanOut('user-123');
    expect(result.items).toHaveLength(0);
    expect(result.failedModules).toHaveLength(0);
  });

  it('sorts overdue items before non-overdue within immediate tier', async () => {
    const overdueState = { ...mockBicStates.immediate, isOverdue: true, dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() };
    const todayState = { ...mockBicStates.immediate, isOverdue: false };

    registerBicModule({
      key: 'bd-scorecard',
      label: 'S',
      queryFn: async () => [
        { itemKey: 'a', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: todayState, href: '/a', title: 'A' },
        { itemKey: 'b', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: overdueState, href: '/b', title: 'B' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items[0].state.isOverdue).toBe(true);
    expect(result.items[1].state.isOverdue).toBe(false);
  });

  it('sorts by dueDate ascending within same tier', async () => {
    const earlyDue = { ...mockBicStates.watch, dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() };
    const lateDue = { ...mockBicStates.watch, dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() };

    registerBicModule({
      key: 'bd-scorecard',
      label: 'S',
      queryFn: async () => [
        { itemKey: 'late', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: lateDue, href: '/late', title: 'Late' },
        { itemKey: 'early', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: earlyDue, href: '/early', title: 'Early' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items[0].itemKey).toBe('early');
    expect(result.items[1].itemKey).toBe('late');
  });

  it('sorts items with null dueDates after items with dueDates', async () => {
    const withDue = { ...mockBicStates.upcoming, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() };
    const noDue = { ...mockBicStates.upcoming, dueDate: null };

    registerBicModule({
      key: 'bd-scorecard',
      label: 'S',
      queryFn: async () => [
        { itemKey: 'no-due', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: noDue, href: '/no-due', title: 'No Due' },
        { itemKey: 'with-due', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: withDue, href: '/with-due', title: 'With Due' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items[0].itemKey).toBe('with-due');
    expect(result.items[1].itemKey).toBe('no-due');
  });

  it('handles both items having null dueDates', async () => {
    const noDue1 = { ...mockBicStates.upcoming, dueDate: null };
    const noDue2 = { ...mockBicStates.upcoming, dueDate: null };

    registerBicModule({
      key: 'bd-scorecard',
      label: 'S',
      queryFn: async () => [
        { itemKey: 'a', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: noDue1, href: '/a', title: 'A' },
        { itemKey: 'b', moduleKey: 'bd-scorecard', moduleLabel: 'S', state: noDue2, href: '/b', title: 'B' },
      ],
    });

    const result = await executeBicFanOut('user-123');
    expect(result.items).toHaveLength(2);
  });
});
