import { describe, it, expect } from 'vitest';
import {
  SHELL_BREAKPOINT_MATRIX,
  runShellHarnessCase,
  runShellConformanceMatrix,
  runShellHarnessMatrix,
  summarizeHarnessProof,
} from '../shellHarness.js';
import { toShellConformanceDataAttributes } from '../shellConformance.js';
import type { ShellEntryStateId } from '../shellTypes.js';

describe('shellHarness — matrix coverage', () => {
  it('matrix covers every required entry class (ten+ cases)', () => {
    const ids = new Set(
      SHELL_BREAKPOINT_MATRIX.map((c) => c.expectedEntryStateId),
    );
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
      expect(ids.has(id), `matrix missing coverage for ${id}`).toBe(true);
    }
  });

  it('every matrix case resolves to its expected entry state', () => {
    const outcomes = runShellHarnessMatrix();
    for (const o of outcomes) {
      expect(
        o.entryStateMatches,
        `${o.matrixCase.label} expected ${o.matrixCase.expectedEntryStateId} but got ${o.proof.entryState.id}`,
      ).toBe(true);
      expect(o.firstLanePairingMatches).toBe(true);
    }
  });

  it('short-height matrix case surfaces short-height override + compact-banner posture marker', () => {
    const outcomes = runShellHarnessMatrix();
    const phoneLandscape = outcomes.find(
      (o) => o.matrixCase.label === 'phone-landscape (short-height constrained)',
    );
    expect(phoneLandscape).toBeDefined();
    expect(phoneLandscape!.proof.entryState.shortHeightConstrained).toBe(true);
    expect(phoneLandscape!.proof.entryState.reason).toBe('short-height-override');
  });

  it('constrained-reflow case (wide width, short height) routes to phone-landscape', () => {
    const outcomes = runShellHarnessMatrix();
    const constrained = outcomes.find(
      (o) => o.matrixCase.label === 'short-height constrained (1300x420)',
    );
    expect(constrained).toBeDefined();
    expect(constrained!.proof.entryState.id).toBe('phone-landscape');
    expect(constrained!.proof.entryState.shortHeightConstrained).toBe(true);
  });

  it('includes required Prompt-07 viewport matrix with exact state/reason mapping', () => {
    const outcomes = runShellHarnessMatrix();
    const required: Array<{
      label: string;
      expectedState: ShellEntryStateId;
      expectedReason: string;
    }> = [
      {
        label: 'ultrawide-desktop (1920x1080)',
        expectedState: 'ultrawide-desktop',
        expectedReason: 'width-match',
      },
      {
        label: 'standard-laptop (1512x982)',
        expectedState: 'standard-laptop',
        expectedReason: 'width-match',
      },
      {
        label: 'standard-laptop (1366x1024)',
        expectedState: 'standard-laptop',
        expectedReason: 'width-match',
      },
      {
        label: 'phone-portrait (430x992)',
        expectedState: 'phone-portrait',
        expectedReason: 'width-match',
      },
      {
        label: 'phone-portrait (390x844)',
        expectedState: 'phone-portrait',
        expectedReason: 'width-match',
      },
      {
        label: 'short-height constrained (1300x420)',
        expectedState: 'phone-landscape',
        expectedReason: 'short-height-override',
      },
    ];
    for (const c of required) {
      const outcome = outcomes.find((o) => o.matrixCase.label === c.label);
      expect(outcome, `missing required matrix case: ${c.label}`).toBeDefined();
      expect(outcome!.proof.entryState.id).toBe(c.expectedState);
      expect(outcome!.proof.entryState.reason).toBe(c.expectedReason);
    }
  });

  it('conformance fit-path attribute matches width-vs-short-height route per case', () => {
    const outcomes = runShellConformanceMatrix();
    for (const outcome of outcomes) {
      const attrs = toShellConformanceDataAttributes(outcome.conformance);
      expect(attrs['data-shell-blackbox-contract']).toBe('prompt07-blackbox-v1');
      const expectedPath = outcome.proof.entryState.shortHeightConstrained
        ? 'short-height-override'
        : 'usable-width-accounted';
      expect(attrs['data-shell-fit-path']).toBe(expectedPath);
      expect(attrs['data-shell-pairing-guard-violations']).toBeGreaterThanOrEqual(0);
      expect(attrs['data-shell-force-stacked-slot-count']).toBeGreaterThanOrEqual(0);
      expect(attrs['data-shell-constrained-slot-count']).toBeGreaterThanOrEqual(0);
    }
  });

  it('ultrawide-desktop stays paired while tablet-landscape degrades to stacked first lane', () => {
    // Wave-01 Prompt-02 tightened the paired ratio to 2:1. With HB Kudos
    // carrying a 520px narrowest-stable-paired comfort, Row 1 needs a
    // container ≥ 1560px to honor pairing — standard-laptop widths
    // (~1300–1512px) now collapse Row 1 until Wave-02 hardens Kudos for
    // narrow-slot use. Ultrawide remains the clean "paired" proof.
    const outcomes = runShellConformanceMatrix();
    const ultrawide = outcomes.find(
      (o) => o.matrixCase.label === 'ultrawide-desktop (1920x1080)',
    );
    const tabletLandscape = outcomes.find(
      (o) => o.matrixCase.label === 'tablet-landscape-large',
    );

    expect(ultrawide?.conformance.entryState.id).toBe('ultrawide-desktop');
    expect(ultrawide?.conformance.bands[0].columns).toBe(2);
    expect(ultrawide?.conformance.bands[0].pairingDecision.reason).toBe('paired');

    expect(tabletLandscape?.conformance.entryState.id).toBe('tablet-landscape');
    expect(tabletLandscape?.conformance.bands[0].columns).toBe(1);
    expect(tabletLandscape?.conformance.bands[0].pairingDecision.reason).toBe(
      'state-denies-pairing',
    );
  });
});

describe('shellHarness — inspectable proof object', () => {
  it('ultrawide-desktop case produces a paired entry band with reason "paired"', () => {
    // See the "ultrawide-desktop stays paired…" case above: the 2:1 ratio
    // requires container ≥ 1560px for Row 1 to honor pairing under the
    // current Kudos comfort contract.
    const proof = runShellHarnessCase({ width: 1800, height: 900, label: 'ultrawide-desktop' });
    expect(proof.entryState.id).toBe('ultrawide-desktop');
    const entryBand = proof.bands[0];
    expect(entryBand.isEntryBand).toBe(true);
    expect(entryBand.columns).toBe(2);
    expect(entryBand.pairingDecision).toEqual({ allowed: true, reason: 'paired' });
  });

  it('tablet-portrait case produces stacked entry band with state-denies-pairing reason', () => {
    const proof = runShellHarnessCase({ width: 900, height: 1200, label: 'tablet' });
    expect(proof.entryState.id).toBe('tablet-portrait-large');
    const entryBand = proof.bands[0];
    expect(entryBand.columns).toBe(1);
    expect(entryBand.pairingDecision.allowed).toBe(false);
    expect(entryBand.pairingDecision.reason).toBe('state-denies-pairing');
  });

  it('phone-landscape case reports shortHeightConstrained + phone-landscape state', () => {
    const proof = runShellHarnessCase({ width: 700, height: 400, label: 'phone-landscape' });
    expect(proof.entryState.id).toBe('phone-landscape');
    expect(proof.entryState.shortHeightConstrained).toBe(true);
    expect(proof.entryState.reason).toBe('short-height-override');
  });

  it('summary line includes state, reason, preset, diagnostics count, and per-band summary', () => {
    const proof = runShellHarnessCase({ width: 1800, label: 'summary-case' });
    const summary = summarizeHarnessProof(proof);
    expect(summary).toContain('state=ultrawide-desktop');
    expect(summary).toContain('reason=width-match');
    expect(summary).toContain('preset=default-v2');
    expect(summary).toContain('bands=[');
    expect(summary).toContain('paired');
  });
});

describe('shellHarness — honors supplied layout input', () => {
  it('routes compact-linear-v1 through the harness and reports zero-paired first band', () => {
    const proof = runShellHarnessCase({
      width: 1800,
      layout: { presetId: 'compact-linear-v1' },
    });
    expect(proof.preset.id).toBe('compact-linear-v1');
    // Compact-linear has no two-occupant bands — every band is columns=1.
    for (const band of proof.bands) {
      expect(band.columns).toBe(1);
    }
  });
});
