// =============================================================================
// Phase-05 shell-only closure proof
// -----------------------------------------------------------------------------
// Executable proof that every Wave-02 shell closure requirement is met:
//
//   Prompt-01  governance model enforced
//   Prompt-02  persisted payload boundary rejects unsafe mutations
//   Prompt-03  canonical preset semantics reported
//   Prompt-04  entry-stack contract aligned across hero / actions / first lane
//   Prompt-05  shell-owned conformance seam produced per case
//   Prompt-06  closure matrix + constrained-state / reflow coverage
//
// This file MUST stay self-contained: it asserts behavior only through
// public seams exported from `shell/index.ts`. If a seam cannot satisfy
// a line below, that is the shell-only gap a future wave must address.
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  APPROVED_PRESETS,
  DEFAULT_PRESET,
  PROTECTED_ENTRY_STACK_RULES,
  SHELL_BREAKPOINT_MATRIX,
  runShellConformanceMatrix,
  runShellHarnessMatrix,
  summarizeHarnessProof,
} from '../index.js';
import { SHELL_GOVERNANCE_MODEL, getGovernanceCategory } from '../protectedDecisions.js';
import { OCCUPANT_REGISTRY, getOccupantGovernance } from '../occupantRegistry.js';
import {
  PERSISTED_POLICY_EXAMPLES,
  PERSISTED_REJECTION_CODES,
  previewPersistedState,
  migratePersistedState,
} from '../shellPersistence.js';
import { validatePresetCanonicalSemantics } from '../presetLibrary.js';
import {
  PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE,
  SHELL_ENTRY_STATE_TO_DEVICE_CLASS,
  SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS,
} from '../../../../homepage/entryStack/entryStackOrchestration.js';
import {
  SHELL_WIDTH_ACCOUNTING_RULE,
  SHELL_WIDTH_SOURCE,
  resolveUsableShellWidth,
} from '../useShellContainer.js';

describe('Phase-05 closure — Prompt-01 governance model', () => {
  it('exposes a unified governance surface with four categories', () => {
    expect(SHELL_GOVERNANCE_MODEL.protected).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.entryStateRules).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.configurable).toBeDefined();
    expect(SHELL_GOVERNANCE_MODEL.descriptors).toBeDefined();
  });

  it('categorizes known protected and configurable decisions correctly', () => {
    expect(getGovernanceCategory('postHeroBoundary')).toBe('protected');
    expect(getGovernanceCategory('optionalOccupantVisibility')).toBe(
      'bounded-configurable',
    );
  });

  it('every occupant carries reorderDomain + visibilityEligibility + allowedBandSemantics', () => {
    for (const occupant of OCCUPANT_REGISTRY.values()) {
      const view = getOccupantGovernance(occupant.id);
      expect(view).toBeDefined();
      expect(view!.reorderDomain).toMatch(/locked|within-band|within-compatible-bands/);
      expect(view!.visibilityEligibility).toBeDefined();
      expect(view!.allowedBandSemantics.length).toBeGreaterThan(0);
    }
  });
});

describe('Phase-05 closure — Prompt-02 persisted payload boundary', () => {
  it('documents at least one allowed and one normalized canonical example', () => {
    expect(PERSISTED_POLICY_EXAMPLES.allowed).toBeDefined();
    expect(PERSISTED_POLICY_EXAMPLES.normalized).toBeDefined();
  });

  it('rejects unknown presetId with a diagnostic', () => {
    const preview = previewPersistedState({
      version: 1,
      presetId: 'made-up-preset-v9',
    });
    expect(preview.rejections.length).toBeGreaterThan(0);
  });

  it('rejects unsupported schema version', () => {
    const migration = migratePersistedState({ version: 2 });
    expect(migration.rejection?.code).toBe(
      PERSISTED_REJECTION_CODES.UNSUPPORTED_VERSION,
    );
  });

  it('rejects hiding a non-hideable occupant (governance enforcement)', () => {
    const preview = previewPersistedState({
      version: 1,
      presetId: 'default-v2',
      occupantVisibility: { 'hb-kudos': 'hidden' },
    });
    expect(
      preview.rejections.some(
        (r) => r.code === PERSISTED_REJECTION_CODES.VISIBILITY_NOT_ELIGIBLE,
      ),
    ).toBe(true);
  });
});

describe('Phase-05 closure — Prompt-03 canonical preset semantics', () => {
  it('all approved presets parse through canonical-semantics validator', () => {
    for (const preset of APPROVED_PRESETS.values()) {
      const diagnostics = validatePresetCanonicalSemantics(preset);
      // Diagnostics may include non-fatal informational guidance, but never
      // error severity.
      const errors = diagnostics.filter((d) => d.severity === 'error');
      expect(errors).toEqual([]);
    }
  });

  it('DEFAULT_PRESET no longer emits empty-band canonical diagnostics', () => {
    const diagnostics = validatePresetCanonicalSemantics(DEFAULT_PRESET);
    expect(diagnostics.some((d) => d.code === 'NON_CANONICAL_EMPTY_BAND')).toBe(false);
  });
});

describe('Phase-09 closure — Prompt-03 hosted-surface shell-fit contracts', () => {
  it('every active occupant exposes a shell-fit declaration', () => {
    for (const occupant of OCCUPANT_REGISTRY.values()) {
      expect(occupant.shellFit.narrowestStableShellWidth).toBeGreaterThan(0);
      expect(occupant.shellFit.narrowestStablePairedWidth).toBeGreaterThan(0);
      expect(occupant.shellFit.supportedModes.length).toBeGreaterThan(0);
    }
  });

  it('constrained matrix cases demonstrate contract-driven nested mode degradation', () => {
    const matrix = runShellHarnessMatrix();
    const constrained = matrix.find(
      (m) => m.matrixCase.label === 'phone-portrait-standard (iPhone 17 Pro)',
    );
    const renderModes = constrained?.proof.bands.flatMap((b) => b.slots.map((s) => s.renderMode));
    expect(renderModes).toBeDefined();
    expect(renderModes).toContain('summary-collapsed');
  });
});

describe('Phase-05 closure — Prompt-04 entry-stack contract alignment', () => {
  it('every shell entry state maps to both production device class and rail device class', () => {
    for (const id of Object.keys(SHELL_ENTRY_STATE_TO_DEVICE_CLASS)) {
      expect(
        SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS[
          id as keyof typeof SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS
        ],
      ).toBeDefined();
    }
  });

  it('rail device-class map covers every rail class', () => {
    expect(Object.keys(PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE).sort()).toEqual(
      ['desktop', 'laptop', 'phone', 'tabletLandscape', 'tabletPortrait'],
    );
  });

  it('protected entry-stack rules remain frozen invariants', () => {
    expect(PROTECTED_ENTRY_STACK_RULES.firstLaneBeginsOnFirstView).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.tabletPortraitForceSingleColumn).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.phoneForceSingleColumn).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.shortHeightCompactBannerMandatory).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.heroHeightBudgetCeilingEnforced).toBe(true);
    expect(PROTECTED_ENTRY_STACK_RULES.overflowMustRemainGoverned).toBe(true);
  });
});

describe('Phase-05 closure — Prompt-05 + Prompt-06 harness + conformance proof', () => {
  const outcomes = runShellConformanceMatrix();

  it('runs every breakpoint matrix case without error', () => {
    expect(outcomes.length).toBe(SHELL_BREAKPOINT_MATRIX.length);
  });

  it('every case resolves the expected entry state', () => {
    for (const o of outcomes) {
      expect(o.entryStateMatches).toBe(true);
      expect(o.firstLanePairingMatches).toBe(true);
    }
  });

  it('no case emits an error-severity diagnostic for the default preset', () => {
    for (const o of outcomes) {
      expect(o.proof.diagnostics.errors).toEqual([]);
    }
  });

  it('tablet-portrait and phone cases produce single-column entry bands', () => {
    const constrainedIds = new Set([
      'tablet-portrait-large',
      'tablet-portrait',
      'phone-portrait',
      'phone-landscape',
    ]);
    for (const o of outcomes) {
      if (constrainedIds.has(o.conformance.entryState.id)) {
        expect(o.conformance.bands[0].columns).toBe(1);
      }
    }
  });

  it('short-height override produces short-height-compact layout mode', () => {
    const shortCase = outcomes.find(
      (o) => o.matrixCase.label === 'constrained-reflow (desktop width, short height)',
    );
    expect(shortCase?.conformance.shortHeightConstrained).toBe(true);
    expect(shortCase?.conformance.layoutMode).toBe('short-height-compact');
  });

  it('paired layout modes only appear at pairing-allowed entry states', () => {
    for (const o of outcomes) {
      const mode = o.conformance.layoutMode;
      if (mode === 'paired-rich' || mode === 'paired-entry') {
        expect(o.conformance.entryState.firstLanePairingAllowed).toBe(true);
      }
    }
  });

  it('entry-stack policy is non-empty and aligned to the active entry state per case', () => {
    for (const o of outcomes) {
      expect(o.conformance.entryStackPolicy.entryStateId).toBe(
        o.conformance.entryState.id,
      );
    }
  });

  it('summarizeHarnessProof produces inspectable one-line output per case', () => {
    for (const o of outcomes) {
      const line = summarizeHarnessProof(o.proof);
      expect(line).toContain('state=');
      expect(line).toContain('bands=[');
    }
  });

  it('standard-laptop baseline keeps a no-overflow width-accounting invariant', () => {
    // Prompt-06 overflow guard: authoritative width must remain the upper bound,
    // and shell usable width must be deductive from inline inset accounting.
    const authoritativeWidth = 1300;
    const inlineInsetTotal = 64; // 2rem + 2rem at 16px base
    const usableWidth = resolveUsableShellWidth(authoritativeWidth, inlineInsetTotal);
    expect(SHELL_WIDTH_SOURCE).toBe('entry-stack-outer-envelope');
    expect(SHELL_WIDTH_ACCOUNTING_RULE).toBe(
      'authoritative-minus-shell-inline-inset',
    );
    expect(usableWidth).toBe(1236);
    expect(usableWidth).toBeLessThan(authoritativeWidth);
    expect(usableWidth).toBeGreaterThan(0);

    const laptop = outcomes.find(
      (o) => o.matrixCase.label === 'standard-laptop (primary baseline)',
    );
    expect(laptop?.conformance.entryState.id).toBe('standard-laptop');
  });
});

describe('Phase-05 closure — reflow-safe constrained-state proof', () => {
  // Constrained widths at the low end of each state should still resolve
  // to the state's own band and must never pair the entry band.
  const matrix = runShellHarnessMatrix();
  it('no constrained case pairs the entry band illegally', () => {
    const constrainedIds = new Set([
      'tablet-landscape',
      'tablet-portrait-large',
      'tablet-portrait',
      'phone-portrait',
      'phone-landscape',
    ]);
    for (const o of matrix) {
      if (constrainedIds.has(o.matrixCase.expectedEntryStateId)) {
        const entryBand = o.proof.bands[0];
        expect(entryBand.columns).toBe(1);
      }
    }
  });

  it('below-narrowest fallback resolves to phone-portrait', () => {
    const fallback = matrix.find((o) => o.matrixCase.label === 'below-narrowest-fallback');
    expect(fallback?.proof.entryState.id).toBe('phone-portrait');
    expect(fallback?.proof.entryState.reason).toBe('fallback-below-narrowest');
  });
});
