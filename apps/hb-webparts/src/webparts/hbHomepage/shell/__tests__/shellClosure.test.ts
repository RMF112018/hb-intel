// Shell closure test suite.
// Integrates the Prompt-02 entry-stack policy, Prompt-03 diagnostics,
// Prompt-04 persistence hardening, and the Prompt-06 harness into a
// single closure-evidence set. Failing here means the shell is not
// closure-ready; passing here does not claim behavioral completeness
// on its own — closure also requires the markdown evidence artifact
// in the phase-04 plan package.

import { describe, it, expect } from 'vitest';
import {
  ENTRY_STACK_POLICY_BY_ENTRY_STATE,
  PROTECTED_ENTRY_STACK_RULES,
  CONFIGURABLE_ENTRY_STACK_REFERENCES,
} from '../entryStackPolicy.js';
import {
  SHELL_PROTECTED_DECISIONS,
  PROTECTED_ENTRY_STATE_RULES,
} from '../protectedDecisions.js';
import {
  SHELL_BREAKPOINT_MATRIX,
  runShellHarnessMatrix,
  summarizeHarnessProof,
} from '../shellHarness.js';
import { hydratePersistedState } from '../shellPersistence.js';
import type { ShellEntryStateId } from '../shellTypes.js';

describe('shell closure — first-lane-first-view invariant', () => {
  it('every entry class encodes the first-lane-first-view expectation', () => {
    for (const [id, policy] of Object.entries(ENTRY_STACK_POLICY_BY_ENTRY_STATE)) {
      const ok =
        policy.firstLaneFirstView === 'begin-on-first-view' ||
        policy.firstLaneFirstView === 'top-portion-visible';
      expect(ok, `entry class ${id} has no first-lane-first-view posture`).toBe(true);
    }
  });

  it('protected entry-stack rule firstLaneBeginsOnFirstView is true', () => {
    expect(PROTECTED_ENTRY_STACK_RULES.firstLaneBeginsOnFirstView).toBe(true);
  });
});

describe('shell closure — protected-rule presence', () => {
  const requiredEntryStateRules: Array<keyof typeof PROTECTED_ENTRY_STATE_RULES> = [
    'tabletPortraitForceSingleColumn',
    'phoneForceSingleColumn',
    'phoneLandscapeForceSingleColumn',
    'firstLanePairingConditional',
    'firstLaneDominantLeftWhenPaired',
    'shortHeightConstrainedCompactBanner',
    'firstLaneMustBeginOnFirstView',
    'recognitionCeilingContextual',
  ];

  it.each(requiredEntryStateRules)('PROTECTED_ENTRY_STATE_RULES retains %s', (key) => {
    expect(PROTECTED_ENTRY_STATE_RULES[key]).toBe(true);
  });

  it('SHELL_PROTECTED_DECISIONS exposes an empty prohibited-pairing list after Wave-01 retirement', () => {
    expect(SHELL_PROTECTED_DECISIONS.prohibitedPairings).toEqual([]);
  });

  it('protected entry-stack rules and configurable references are disjoint (closure invariant)', () => {
    const protectedKeys = new Set(Object.keys(PROTECTED_ENTRY_STACK_RULES));
    for (const k of Object.keys(CONFIGURABLE_ENTRY_STACK_REFERENCES)) {
      expect(protectedKeys.has(k)).toBe(false);
    }
  });
});

describe('shell closure — persisted-state normalization', () => {
  it('unapproved preset is sanitized + diagnosed through persisted hydration', () => {
    const hydrated = hydratePersistedState({
      version: 1,
      presetId: 'rogue-preset',
    });
    expect(hydrated.preset.id).toBe('default-v2');
    expect(
      hydrated.diagnostics.some((d) => d.code === 'PERSISTED_STATE_SANITIZED'),
    ).toBe(true);
  });
});

describe('shell closure — breakpoint matrix evidence', () => {
  it('every matrix case produces a successful outcome under the default preset', () => {
    const outcomes = runShellHarnessMatrix();
    for (const o of outcomes) {
      expect(
        o.entryStateMatches && o.firstLanePairingMatches,
        `${o.matrixCase.label} failed closure: state=${o.proof.entryState.id} pairing=${o.proof.entryState.firstLanePairingAllowed}`,
      ).toBe(true);
    }
  });

  it('every matrix case renders through a declared preset band and emits zero error diagnostics', () => {
    const outcomes = runShellHarnessMatrix();
    for (const o of outcomes) {
      expect(
        o.proof.diagnostics.errors,
        `${o.matrixCase.label} emitted unexpected error diagnostics`,
      ).toEqual([]);
      expect(o.proof.preset.id).toBe('default-v2');
    }
  });

  it('matrix outcomes include short-height override coverage for phone-landscape', () => {
    const outcomes = runShellHarnessMatrix();
    const shortHeightOutcomes = outcomes.filter(
      (o) => o.proof.entryState.shortHeightConstrained,
    );
    expect(shortHeightOutcomes.length).toBeGreaterThanOrEqual(2);
    for (const o of shortHeightOutcomes) {
      expect(o.proof.entryState.id).toBe('phone-landscape');
    }
  });

  it('matrix covers every declared ShellEntryStateId', () => {
    const ids = new Set(SHELL_BREAKPOINT_MATRIX.map((c) => c.expectedEntryStateId));
    const required: ShellEntryStateId[] = [
      'ultrawide-desktop',
      'standard-laptop',
      'tablet-landscape',
      'tablet-portrait-large',
      'tablet-portrait',
      'phone-portrait',
      'phone-landscape',
    ];
    for (const id of required) {
      expect(ids.has(id), `matrix missing entry class ${id}`).toBe(true);
    }
  });

  it('summaries are stable, human-readable, and name every state once per case', () => {
    const outcomes = runShellHarnessMatrix();
    const lines = outcomes.map((o) => summarizeHarnessProof(o.proof));
    for (const [i, line] of lines.entries()) {
      expect(line).toContain('state=');
      expect(line).toContain('reason=');
      expect(line).toContain('preset=');
      expect(line).toContain('bands=[');
      expect(line).toContain(outcomes[i].matrixCase.label);
    }
  });
});
