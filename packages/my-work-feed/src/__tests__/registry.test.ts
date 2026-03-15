import { MyWorkRegistry } from '../registry/MyWorkRegistry.js';
import {
  createMockRegistryEntry,
  createMockSourceAdapter,
  createMockRuntimeContext,
} from '@hbc/my-work-feed/testing';

describe('MyWorkRegistry', () => {
  afterEach(() => {
    MyWorkRegistry._clearForTesting();
  });

  describe('register', () => {
    it('registers entries and retrieves them', () => {
      const entry = createMockRegistryEntry({ source: 'bic-next-move' });
      MyWorkRegistry.register([entry]);

      expect(MyWorkRegistry.size()).toBe(1);
      expect(MyWorkRegistry.getAll()).toHaveLength(1);
    });

    it('registers multiple entries at once', () => {
      MyWorkRegistry.register([
        createMockRegistryEntry({ source: 'bic-next-move' }),
        createMockRegistryEntry({
          source: 'workflow-handoff',
          adapter: createMockSourceAdapter({ source: 'workflow-handoff' }),
        }),
      ]);

      expect(MyWorkRegistry.size()).toBe(2);
    });

    it('throws on duplicate source', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move' })]);

      expect(() => {
        MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move' })]);
      }).toThrow('duplicate source "bic-next-move"');
    });

    it('throws when source is empty string', () => {
      expect(() => {
        MyWorkRegistry.register([
          createMockRegistryEntry({ source: '' as never }),
        ]);
      }).toThrow('source must be a non-empty string');
    });

    it('throws when adapter.source does not match entry source', () => {
      const adapter = createMockSourceAdapter({ source: 'module' });
      expect(() => {
        MyWorkRegistry.register([
          createMockRegistryEntry({ source: 'bic-next-move', adapter }),
        ]);
      }).toThrow('adapter.source "module" does not match entry source "bic-next-move"');
    });

    it('throws when rankingWeight is out of range', () => {
      expect(() => {
        MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move', rankingWeight: 1.5 })]);
      }).toThrow('rankingWeight must be between 0 and 1');

      expect(() => {
        MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move', rankingWeight: -0.1 })]);
      }).toThrow('rankingWeight must be between 0 and 1');
    });

    it('defaults rankingWeight to 0.5 when not provided', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move', rankingWeight: undefined })]);
      const entry = MyWorkRegistry.getBySource('bic-next-move');
      expect(entry?.rankingWeight).toBe(0.5);
    });

    it('defaults enabledByDefault to true when not provided', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move', enabledByDefault: undefined })]);
      const entry = MyWorkRegistry.getBySource('bic-next-move');
      expect(entry?.enabledByDefault).toBe(true);
    });

    it('freezes registered entries', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move' })]);
      const entry = MyWorkRegistry.getBySource('bic-next-move')!;
      expect(Object.isFrozen(entry)).toBe(true);
    });
  });

  describe('getBySource', () => {
    it('returns entry for registered source', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move' })]);
      expect(MyWorkRegistry.getBySource('bic-next-move')).toBeDefined();
      expect(MyWorkRegistry.getBySource('bic-next-move')?.source).toBe('bic-next-move');
    });

    it('returns undefined for unregistered source', () => {
      expect(MyWorkRegistry.getBySource('bic-next-move')).toBeUndefined();
    });
  });

  describe('getEnabledSources', () => {
    it('filters by enabledByDefault', () => {
      MyWorkRegistry.register([
        createMockRegistryEntry({ source: 'bic-next-move', enabledByDefault: true }),
        createMockRegistryEntry({
          source: 'workflow-handoff',
          adapter: createMockSourceAdapter({ source: 'workflow-handoff' }),
          enabledByDefault: false,
        }),
      ]);

      const ctx = createMockRuntimeContext();
      const enabled = MyWorkRegistry.getEnabledSources(ctx);
      expect(enabled).toHaveLength(1);
      expect(enabled[0].source).toBe('bic-next-move');
    });

    it('filters by adapter.isEnabled', () => {
      MyWorkRegistry.register([
        createMockRegistryEntry({
          source: 'bic-next-move',
          adapter: createMockSourceAdapter({ source: 'bic-next-move', isEnabled: () => false }),
        }),
      ]);

      const ctx = createMockRuntimeContext();
      expect(MyWorkRegistry.getEnabledSources(ctx)).toHaveLength(0);
    });

    it('returns all enabled entries when all pass', () => {
      MyWorkRegistry.register([
        createMockRegistryEntry({ source: 'bic-next-move' }),
        createMockRegistryEntry({
          source: 'workflow-handoff',
          adapter: createMockSourceAdapter({ source: 'workflow-handoff' }),
        }),
      ]);

      const ctx = createMockRuntimeContext();
      expect(MyWorkRegistry.getEnabledSources(ctx)).toHaveLength(2);
    });
  });

  describe('_clearForTesting', () => {
    it('clears all entries', () => {
      MyWorkRegistry.register([createMockRegistryEntry({ source: 'bic-next-move' })]);
      expect(MyWorkRegistry.size()).toBe(1);

      MyWorkRegistry._clearForTesting();
      expect(MyWorkRegistry.size()).toBe(0);
      expect(MyWorkRegistry.getAll()).toHaveLength(0);
    });
  });
});
