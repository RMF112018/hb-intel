import { describe, it, expect } from 'vitest';
import {
  CONFIGURABLE_ENTRY_STACK_REFERENCES,
  ENTRY_STACK_POLICY_BY_ENTRY_STATE,
  PROTECTED_ENTRY_STACK_RULES,
  getEntryStackPolicy,
  isHeroHeightWithinBudget,
  isVisibleActionCountWithinBudget,
  resolveEntryStackPolicy,
} from '../entryStackPolicy.js';
import { SHELL_ENTRY_STATES } from '../breakpointPolicy.js';
import type { ShellEntryStateId } from '../shellTypes.js';

describe('entryStackPolicy — coverage', () => {
  it('has a policy for every declared ShellEntryStateId', () => {
    for (const state of SHELL_ENTRY_STATES) {
      const policy = ENTRY_STACK_POLICY_BY_ENTRY_STATE[state.id];
      expect(policy).toBeDefined();
      expect(policy.entryStateId).toBe(state.id);
    }
  });

  it('resolveEntryStackPolicy returns the same object as getEntryStackPolicy for an entry state', () => {
    for (const state of SHELL_ENTRY_STATES) {
      expect(resolveEntryStackPolicy(state)).toBe(getEntryStackPolicy(state.id));
    }
  });
});

describe('entryStackPolicy — encoded hero height budgets', () => {
  const cases: Array<[ShellEntryStateId, number, number]> = [
    ['ultrawide-desktop', 420, 460],
    ['standard-laptop', 340, 380],
    ['tablet-landscape', 280, 320],
    ['tablet-portrait-large', 240, 280],
    ['tablet-portrait', 240, 280],
    ['phone-portrait', 190, 220],
    ['phone-landscape', 120, 160],
  ];

  it.each(cases)('%s hero height budget is %i..%i px', (id, min, max) => {
    const policy = getEntryStackPolicy(id);
    expect(policy.heroHeightBudgetPx).toEqual({ min, max });
  });
});

describe('entryStackPolicy — encoded visible action budgets', () => {
  const cases: Array<[ShellEntryStateId, number, number]> = [
    ['ultrawide-desktop', 6, 6],
    ['standard-laptop', 5, 5],
    ['tablet-landscape', 4, 6],
    ['tablet-portrait-large', 4, 4],
    ['tablet-portrait', 4, 4],
    ['phone-portrait', 3, 4],
    ['phone-landscape', 0, 4],
  ];

  it.each(cases)('%s visible-action budget is %i..%i', (id, min, max) => {
    const policy = getEntryStackPolicy(id);
    expect(policy.visiblePrimaryActionsBudget).toEqual({ min, max });
  });
});

describe('entryStackPolicy — postures', () => {
  it('phone-landscape short-height posture is compact-banner', () => {
    expect(getEntryStackPolicy('phone-landscape').shortHeightPosture).toBe(
      'compact-banner',
    );
  });

  it('non-short-height classes have shortHeightPosture = not-applicable', () => {
    const classes: ShellEntryStateId[] = [
      'ultrawide-desktop',
      'standard-laptop',
      'tablet-landscape',
      'tablet-portrait-large',
      'tablet-portrait',
      'phone-portrait',
    ];
    for (const id of classes) {
      expect(getEntryStackPolicy(id).shortHeightPosture).toBe('not-applicable');
    }
  });

  it('tablet portrait and phone classes force single-column first lane', () => {
    const single: ShellEntryStateId[] = [
      'tablet-landscape',
      'tablet-portrait-large',
      'tablet-portrait',
      'phone-portrait',
      'phone-landscape',
    ];
    for (const id of single) {
      expect(getEntryStackPolicy(id).firstLaneSingleColumnOnly).toBe(true);
    }
  });

  it('ultrawide-desktop and standard-laptop permit multi-column first lanes', () => {
    expect(getEntryStackPolicy('ultrawide-desktop').firstLaneSingleColumnOnly).toBe(false);
    expect(getEntryStackPolicy('standard-laptop').firstLaneSingleColumnOnly).toBe(false);
  });

  it('all classes require the first lane to begin on first view', () => {
    for (const id of Object.keys(
      ENTRY_STACK_POLICY_BY_ENTRY_STATE,
    ) as ShellEntryStateId[]) {
      const expected =
        id === 'standard-laptop' ? 'top-portion-visible' : 'begin-on-first-view';
      expect(getEntryStackPolicy(id).firstLaneFirstView).toBe(expected);
    }
  });

  it('ultrawide-desktop encodes spec spacing budgets (24 / 28..32)', () => {
    const policy = getEntryStackPolicy('ultrawide-desktop');
    expect(policy.spacing?.heroToActionsGap).toEqual({ min: 24, max: 24 });
    expect(policy.spacing?.actionsToFirstLaneGap).toEqual({ min: 28, max: 32 });
  });
});

describe('entryStackPolicy — validation helpers', () => {
  it('isHeroHeightWithinBudget honors the per-class range', () => {
    expect(isHeroHeightWithinBudget('standard-laptop', 360)).toBe(true);
    expect(isHeroHeightWithinBudget('standard-laptop', 500)).toBe(false);
    expect(isHeroHeightWithinBudget('phone-landscape', 140)).toBe(true);
    expect(isHeroHeightWithinBudget('phone-landscape', 260)).toBe(false);
  });

  it('isVisibleActionCountWithinBudget honors the per-class range', () => {
    expect(isVisibleActionCountWithinBudget('ultrawide-desktop', 6)).toBe(true);
    expect(isVisibleActionCountWithinBudget('ultrawide-desktop', 7)).toBe(false);
    expect(isVisibleActionCountWithinBudget('phone-portrait', 3)).toBe(true);
    expect(isVisibleActionCountWithinBudget('phone-portrait', 5)).toBe(false);
  });
});

describe('entryStackPolicy — protected vs configurable surface', () => {
  it('protected rules contain the governing invariants', () => {
    expect(PROTECTED_ENTRY_STACK_RULES.firstLaneBeginsOnFirstView).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.heroHeightBudgetCeilingEnforced).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.tabletPortraitForceSingleColumn).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.phoneForceSingleColumn).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.shortHeightCompactBannerMandatory).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.overflowMustRemainGoverned).toBe(true);
  });

  it('configurable references name only bounded control-panel knobs', () => {
    const keys = Object.keys(CONFIGURABLE_ENTRY_STACK_REFERENCES).sort();
    expect(keys).toEqual(
      [
        'authoredActionSelection',
        'heroHeightWithinBudget',
        'overflowAffordanceLabel',
        'visibleActionsWithinBudget',
      ].sort(),
    );
  });

  it('protected and configurable surfaces are disjoint', () => {
    const protectedKeys = new Set(Object.keys(PROTECTED_ENTRY_STACK_RULES));
    for (const k of Object.keys(CONFIGURABLE_ENTRY_STACK_REFERENCES)) {
      expect(protectedKeys.has(k)).toBe(false);
    }
  });
});
