import { describe, expect, it, beforeEach } from 'vitest';
import { ProjectActivityRegistry } from './ProjectActivityRegistry.js';
import type { IActivitySourceRegistration, IActivitySourceAdapter } from '@hbc/models';

function createMockAdapter(moduleKey: string): IActivitySourceAdapter {
  return {
    moduleKey,
    isEnabled: () => true,
    loadRecentActivity: async () => [],
    getEventTypeMetadata: () => null,
  };
}

function createMockRegistration(
  moduleKey: string,
  overrides?: Partial<IActivitySourceRegistration>,
): IActivitySourceRegistration {
  return {
    moduleKey,
    supportedEventTypes: [`${moduleKey}.updated`],
    adapter: createMockAdapter(moduleKey),
    enabledByDefault: true,
    significanceDefaults: { [`${moduleKey}.updated`]: 'routine' },
    ...overrides,
  };
}

describe('ProjectActivityRegistry', () => {
  beforeEach(() => {
    ProjectActivityRegistry._clearForTesting();
  });

  it('registers adapters', () => {
    ProjectActivityRegistry.register([createMockRegistration('financial')]);
    expect(ProjectActivityRegistry.size()).toBe(1);
  });

  it('rejects duplicate moduleKey', () => {
    ProjectActivityRegistry._clearForTesting();
    expect(() =>
      ProjectActivityRegistry.register([
        createMockRegistration('financial'),
        createMockRegistration('financial'),
      ]),
    ).toThrow('Duplicate');
  });

  it('freezes after first registration', () => {
    ProjectActivityRegistry.register([createMockRegistration('financial')]);
    expect(() =>
      ProjectActivityRegistry.register([createMockRegistration('schedule')]),
    ).toThrow('frozen');
  });

  it('rejects mismatched adapter.moduleKey', () => {
    expect(() =>
      ProjectActivityRegistry.register([
        createMockRegistration('financial', {
          adapter: createMockAdapter('wrong-key'),
        }),
      ]),
    ).toThrow('does not match');
  });

  it('getByModule returns the correct adapter', () => {
    ProjectActivityRegistry.register([
      createMockRegistration('financial'),
      createMockRegistration('schedule'),
    ]);
    const result = ProjectActivityRegistry.getByModule('schedule');
    expect(result?.moduleKey).toBe('schedule');
  });

  it('getByModule returns undefined for unknown module', () => {
    ProjectActivityRegistry.register([createMockRegistration('financial')]);
    expect(ProjectActivityRegistry.getByModule('unknown')).toBeUndefined();
  });

  it('getEnabledSources filters by enabledByDefault and isEnabled', () => {
    const disabledAdapter = createMockAdapter('disabled');
    disabledAdapter.isEnabled = () => false;

    ProjectActivityRegistry.register([
      createMockRegistration('financial'),
      createMockRegistration('disabled', { adapter: disabledAdapter }),
      createMockRegistration('notDefault', { enabledByDefault: false }),
    ]);

    const enabled = ProjectActivityRegistry.getEnabledSources({
      projectId: 'proj-001',
      userUpn: 'user@example.com',
    });
    expect(enabled).toHaveLength(1);
    expect(enabled[0].moduleKey).toBe('financial');
  });

  it('getAll returns all registered entries', () => {
    ProjectActivityRegistry.register([
      createMockRegistration('financial'),
      createMockRegistration('schedule'),
    ]);
    expect(ProjectActivityRegistry.getAll()).toHaveLength(2);
  });

  it('_clearForTesting resets the registry', () => {
    ProjectActivityRegistry.register([createMockRegistration('financial')]);
    ProjectActivityRegistry._clearForTesting();
    expect(ProjectActivityRegistry.size()).toBe(0);
  });
});
