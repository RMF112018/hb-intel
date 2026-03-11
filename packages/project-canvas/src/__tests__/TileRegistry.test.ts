import { register, registerMany, get, getAll, _clearRegistryForTests } from '../registry/index.js';
import { createMockTileDefinition } from '@hbc/project-canvas/testing';

beforeEach(() => {
  _clearRegistryForTests();
});

afterEach(() => {
  _clearRegistryForTests();
});

describe('register (D-01)', () => {
  it('registers a tile definition', () => {
    const tile = createMockTileDefinition({ tileKey: 'test-tile' });
    register(tile);
    expect(get('test-tile')).toBe(tile);
  });

  it('throws on duplicate tileKey', () => {
    const tile = createMockTileDefinition({ tileKey: 'dup-tile' });
    register(tile);
    expect(() => register(tile)).toThrow(
      '[project-canvas] Tile "dup-tile" is already registered. Duplicate registration is not allowed.',
    );
  });

  it('throws if essential variant missing', () => {
    const tile = createMockTileDefinition({
      tileKey: 'no-essential',
      component: {
        essential: undefined as never,
        standard: createMockTileDefinition().component.standard,
        expert: createMockTileDefinition().component.expert,
      },
    });
    expect(() => register(tile)).toThrow(
      'must provide essential, standard, and expert component variants',
    );
  });

  it('throws if standard variant missing', () => {
    const tile = createMockTileDefinition({
      tileKey: 'no-standard',
      component: {
        essential: createMockTileDefinition().component.essential,
        standard: undefined as never,
        expert: createMockTileDefinition().component.expert,
      },
    });
    expect(() => register(tile)).toThrow(
      'must provide essential, standard, and expert component variants',
    );
  });

  it('throws if expert variant missing', () => {
    const tile = createMockTileDefinition({
      tileKey: 'no-expert',
      component: {
        essential: createMockTileDefinition().component.essential,
        standard: createMockTileDefinition().component.standard,
        expert: undefined as never,
      },
    });
    expect(() => register(tile)).toThrow(
      'must provide essential, standard, and expert component variants',
    );
  });

  it('registers tile with optional aiComponent', () => {
    const tile = createMockTileDefinition({
      tileKey: 'ai-tile',
      aiComponent: createMockTileDefinition().component.essential,
    });
    register(tile);
    const retrieved = get('ai-tile');
    expect(retrieved?.aiComponent).toBeDefined();
  });
});

describe('registerMany (D-01)', () => {
  it('registers multiple tiles', () => {
    const tiles = [
      createMockTileDefinition({ tileKey: 'tile-a' }),
      createMockTileDefinition({ tileKey: 'tile-b' }),
      createMockTileDefinition({ tileKey: 'tile-c' }),
    ];
    registerMany(tiles);
    expect(getAll()).toHaveLength(3);
  });

  it('throws on first duplicate in batch', () => {
    const tileA = createMockTileDefinition({ tileKey: 'tile-a' });
    register(tileA);

    const batch = [
      createMockTileDefinition({ tileKey: 'tile-b' }),
      createMockTileDefinition({ tileKey: 'tile-a' }), // duplicate
    ];
    expect(() => registerMany(batch)).toThrow('already registered');
  });
});

describe('get', () => {
  it('returns definition for registered key', () => {
    const tile = createMockTileDefinition({ tileKey: 'existing' });
    register(tile);
    expect(get('existing')).toBe(tile);
  });

  it('returns undefined for unknown key', () => {
    expect(get('nonexistent')).toBeUndefined();
  });
});

describe('getAll', () => {
  it('returns empty array when no tiles registered', () => {
    expect(getAll()).toEqual([]);
  });

  it('returns all registered tiles', () => {
    register(createMockTileDefinition({ tileKey: 'alpha' }));
    register(createMockTileDefinition({ tileKey: 'beta' }));
    const all = getAll();
    expect(all).toHaveLength(2);
    expect(all.map((t) => t.tileKey)).toEqual(['alpha', 'beta']);
  });
});

describe('governance metadata (D-05)', () => {
  it('preserves mandatory flag on registered tile', () => {
    const tile = createMockTileDefinition({ tileKey: 'mandatory-tile', mandatory: true });
    register(tile);
    expect(get('mandatory-tile')?.mandatory).toBe(true);
  });

  it('preserves lockable flag on registered tile', () => {
    const tile = createMockTileDefinition({ tileKey: 'lockable-tile', lockable: true });
    register(tile);
    expect(get('lockable-tile')?.lockable).toBe(true);
  });
});
