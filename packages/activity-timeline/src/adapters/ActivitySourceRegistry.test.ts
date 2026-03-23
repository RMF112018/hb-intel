import { describe, expect, it, beforeEach } from 'vitest';
import { ActivitySourceRegistry } from './ActivitySourceRegistry.js';
import type { IActivitySourceRegistration, IActivitySourceAdapter } from '../types/index.js';

function createMockAdapter(moduleKey: string): IActivitySourceAdapter {
  return {
    moduleKey,
    isEnabled: () => true,
    loadRecentActivity: async () => [],
    getEventTypeMetadata: () => null,
  };
}

function createReg(moduleKey: string, overrides?: Partial<IActivitySourceRegistration>): IActivitySourceRegistration {
  return {
    moduleKey,
    supportedEventTypes: [`${moduleKey}.updated`],
    adapter: createMockAdapter(moduleKey),
    enabledByDefault: true,
    significanceDefaults: {},
    ...overrides,
  };
}

describe('ActivitySourceRegistry', () => {
  beforeEach(() => {
    ActivitySourceRegistry._clearForTesting();
  });

  it('registers adapters', () => {
    ActivitySourceRegistry.register([createReg('financial')]);
    expect(ActivitySourceRegistry.size()).toBe(1);
  });

  it('rejects duplicate moduleKey', () => {
    expect(() =>
      ActivitySourceRegistry.register([createReg('financial'), createReg('financial')]),
    ).toThrow('Duplicate');
  });

  it('freezes after first registration', () => {
    ActivitySourceRegistry.register([createReg('financial')]);
    expect(() =>
      ActivitySourceRegistry.register([createReg('schedule')]),
    ).toThrow('frozen');
  });

  it('rejects mismatched adapter.moduleKey', () => {
    expect(() =>
      ActivitySourceRegistry.register([
        createReg('financial', { adapter: createMockAdapter('wrong') }),
      ]),
    ).toThrow('does not match');
  });

  it('getByModule returns correct adapter', () => {
    ActivitySourceRegistry.register([createReg('financial'), createReg('schedule')]);
    expect(ActivitySourceRegistry.getByModule('schedule')?.moduleKey).toBe('schedule');
  });

  it('getByModule returns undefined for unknown', () => {
    ActivitySourceRegistry.register([createReg('financial')]);
    expect(ActivitySourceRegistry.getByModule('unknown')).toBeUndefined();
  });

  it('getEnabled filters by enabledByDefault and isEnabled', () => {
    const disabled = createMockAdapter('disabled');
    disabled.isEnabled = () => false;

    ActivitySourceRegistry.register([
      createReg('financial'),
      createReg('disabled', { adapter: disabled }),
      createReg('notDefault', { enabledByDefault: false }),
    ]);

    const enabled = ActivitySourceRegistry.getEnabled({ projectId: 'p1', userUpn: 'u@e.com' });
    expect(enabled).toHaveLength(1);
    expect(enabled[0].moduleKey).toBe('financial');
  });

  it('getAll returns all entries', () => {
    ActivitySourceRegistry.register([createReg('a'), createReg('b')]);
    expect(ActivitySourceRegistry.getAll()).toHaveLength(2);
  });

  it('_clearForTesting resets', () => {
    ActivitySourceRegistry.register([createReg('a')]);
    ActivitySourceRegistry._clearForTesting();
    expect(ActivitySourceRegistry.size()).toBe(0);
  });
});
