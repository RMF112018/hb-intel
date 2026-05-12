import {
  MY_WORK_MODULE_IDS,
  MY_WORK_MODULE_STATE_COPY,
  MY_WORK_MODULE_STATES,
  MY_WORK_NAVIGATION_MODULES,
  MY_WORK_PRIMARY_NAVIGATION_SURFACES,
  MY_WORK_PRIMARY_SURFACE_IDS,
  getMyWorkModule,
  getMyWorkModulesForPrimarySurface,
  getMyWorkPrimaryNavigationSurface,
  isSelectableMyWorkModule,
  normalizeMyWorkModuleId,
  normalizeMyWorkPrimarySurfaceId,
  type MyWorkNavigationModule,
  type MyWorkPrimaryNavigationSurface,
} from './MyWorkNavigation.js';

describe('My Work navigation registry — MVP surface ids', () => {
  it('exposes exactly one primary surface id: my-work-home', () => {
    expect(MY_WORK_PRIMARY_SURFACE_IDS).toEqual(['my-work-home']);
    expect(MY_WORK_PRIMARY_SURFACE_IDS).toHaveLength(1);
  });
});

describe('My Work navigation registry — MVP module ids', () => {
  it('exposes exactly one module id: adobe-sign-action-queue', () => {
    expect(MY_WORK_MODULE_IDS).toEqual(['adobe-sign-action-queue']);
    expect(MY_WORK_MODULE_IDS).toHaveLength(1);
  });
});

describe('My Work navigation registry — state vocabulary', () => {
  it('contains the eight canonical B03 states', () => {
    expect(MY_WORK_MODULE_STATES).toEqual([
      'available',
      'preview',
      'read-only',
      'configuration-required',
      'authorization-required',
      'principal-unresolved',
      'source-unavailable',
      'deferred',
    ]);
  });

  it('does not include the read-model envelope concept "partial"', () => {
    expect((MY_WORK_MODULE_STATES as readonly string[]).includes('partial')).toBe(false);
  });

  it('publishes a state-copy entry for every state with a non-empty stateLabel and reason', () => {
    for (const state of MY_WORK_MODULE_STATES) {
      const copy = MY_WORK_MODULE_STATE_COPY[state];
      expect(copy).toBeDefined();
      expect(copy.stateLabel.length).toBeGreaterThan(0);
      expect(copy.reason.length).toBeGreaterThan(0);
    }
  });

  it('labels read-only as exactly "Read-only"', () => {
    expect(MY_WORK_MODULE_STATE_COPY['read-only'].stateLabel).toBe('Read-only');
  });
});

describe('My Work primary surface record', () => {
  it('contains exactly one surface with the spec-defined My Work Home record', () => {
    expect(MY_WORK_PRIMARY_NAVIGATION_SURFACES).toHaveLength(1);
    const [surface] = MY_WORK_PRIMARY_NAVIGATION_SURFACES;
    const expected: MyWorkPrimaryNavigationSurface = {
      id: 'my-work-home',
      label: 'My Work Home',
      dashboardTitle: 'My Work',
      dashboardDescription:
        'Your personal command surface for work requiring attention across connected HB systems.',
      modules: ['adobe-sign-action-queue'],
    };
    expect(surface).toEqual(expected);
  });
});

describe('My Work Adobe Sign Action Queue module record', () => {
  it('exposes the spec-defined module record', () => {
    expect(MY_WORK_NAVIGATION_MODULES).toHaveLength(1);
    const [mod] = MY_WORK_NAVIGATION_MODULES;
    const expected: MyWorkNavigationModule = {
      id: 'adobe-sign-action-queue',
      label: 'Adobe Sign Action Queue',
      parentSurfaceId: 'my-work-home',
      state: 'read-only',
      stateLabel: 'Read-only',
      summary:
        'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
      authorityCue: 'Queue visibility only. Agreement actions remain in Adobe Sign.',
      sourceSystem: 'Adobe Sign',
      selectable: true,
    };
    expect(mod).toEqual(expected);
  });
});

describe('My Work navigation helpers — lookup', () => {
  it('getMyWorkPrimaryNavigationSurface returns the my-work-home record', () => {
    const surface = getMyWorkPrimaryNavigationSurface('my-work-home');
    expect(surface.id).toBe('my-work-home');
    expect(surface.modules).toEqual(['adobe-sign-action-queue']);
  });

  it('getMyWorkPrimaryNavigationSurface throws on unknown id', () => {
    expect(() =>
      getMyWorkPrimaryNavigationSurface('not-a-real-surface' as never),
    ).toThrow(/Unknown My Work primary surface id/);
  });

  it('getMyWorkModule returns the adobe-sign-action-queue record', () => {
    const mod = getMyWorkModule('adobe-sign-action-queue');
    expect(mod.id).toBe('adobe-sign-action-queue');
    expect(mod.parentSurfaceId).toBe('my-work-home');
  });

  it('getMyWorkModule throws on unknown id', () => {
    expect(() => getMyWorkModule('not-a-real-module' as never)).toThrow(
      /Unknown My Work module id/,
    );
  });

  it('getMyWorkModulesForPrimarySurface returns the Adobe queue module for my-work-home', () => {
    const modules = getMyWorkModulesForPrimarySurface('my-work-home');
    expect(modules).toHaveLength(1);
    expect(modules[0].id).toBe('adobe-sign-action-queue');
  });

  it('isSelectableMyWorkModule mirrors the module.selectable flag', () => {
    const adobe = getMyWorkModule('adobe-sign-action-queue');
    expect(isSelectableMyWorkModule(adobe)).toBe(true);
    expect(isSelectableMyWorkModule({ ...adobe, selectable: false })).toBe(false);
  });
});

describe('My Work navigation helpers — normalization', () => {
  it('normalizeMyWorkPrimarySurfaceId echoes valid input', () => {
    expect(normalizeMyWorkPrimarySurfaceId('my-work-home')).toBe('my-work-home');
  });

  it('normalizeMyWorkPrimarySurfaceId falls back to my-work-home for invalid input', () => {
    expect(normalizeMyWorkPrimarySurfaceId('nope')).toBe('my-work-home');
    expect(normalizeMyWorkPrimarySurfaceId(undefined)).toBe('my-work-home');
    expect(normalizeMyWorkPrimarySurfaceId(null)).toBe('my-work-home');
    expect(normalizeMyWorkPrimarySurfaceId(42)).toBe('my-work-home');
    expect(normalizeMyWorkPrimarySurfaceId({})).toBe('my-work-home');
  });

  it('normalizeMyWorkModuleId echoes valid input', () => {
    expect(normalizeMyWorkModuleId('adobe-sign-action-queue')).toBe('adobe-sign-action-queue');
  });

  it('normalizeMyWorkModuleId returns undefined for invalid input', () => {
    expect(normalizeMyWorkModuleId('nope')).toBeUndefined();
    expect(normalizeMyWorkModuleId(undefined)).toBeUndefined();
    expect(normalizeMyWorkModuleId(null)).toBeUndefined();
    expect(normalizeMyWorkModuleId(123)).toBeUndefined();
  });
});
