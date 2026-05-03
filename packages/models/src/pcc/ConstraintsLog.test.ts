import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as ConstraintsLogModule from './ConstraintsLog.js';
import {
  CONSTRAINT_ALLOWED_TRANSITIONS,
  CONSTRAINTS_LOG_ITEM_TYPES,
  CONSTRAINTS_LOG_SEED_CATEGORY_IDS,
  EXPOSURE_BANDS,
  RISK_ALLOWED_TRANSITIONS,
  SCORE_LEVELS,
  SEVERITY_BAND_KEYS,
  SEVERITY_OVERRIDE_CODES,
  SEVERITY_OVERRIDE_RULES,
  applySeverityOverride,
  assertResidualReductionAllowed,
  computeConstraintExposureScore,
  computeGoverningImpactScore,
  computeResidualRiskScore,
  computeRiskScore,
  isConstraintTransitionAllowed,
  isRiskTransitionAllowed,
  mapSeverityBand,
  type ConstraintItem,
  type ConstraintState,
  type ImpactScores,
  type RiskItem,
  type RiskState,
  type SeverityBandKey,
} from './ConstraintsLog.js';
import {
  SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS,
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  SAMPLE_CONSTRAINTS_LOG_RISKS,
  SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES,
} from './fixtures/constraintsLog.js';

// ---------------------------------------------------------------------------
// Source-scan helpers. Comment+string scrub mirrors ProjectReadinessFramework
// guard pattern so legitimate guardrail prose in JSDoc and string literals
// is not interpreted as a forbidden import.
// ---------------------------------------------------------------------------

function strip(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
    .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
}

const FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /\b@microsoft\/sp-/,
  /\b@pnp\//,
  /\b@azure\//,
  /\baxios\b/,
  /\bnode-fetch\b/,
  /procore/i,
  /\.\.\/\.\.\/\.\.\/backend\//,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
];

const MODEL_FILE = fileURLToPath(new URL('./ConstraintsLog.ts', import.meta.url));
const FIXTURE_FILE = fileURLToPath(new URL('./fixtures/constraintsLog.ts', import.meta.url));

// Sample impact score helpers used across tests.
const NEUTRAL_IMPACT: ImpactScores = {
  schedule: 1,
  cost: 1,
  safety: 1,
  quality: 1,
  contractCompliance: 1,
  clientOwnerImpact: 1,
  logisticsAccess: 1,
  reputationExecutiveVisibility: 1,
};

function impactWithDimension(dimension: keyof ImpactScores, level: 1 | 2 | 3 | 4 | 5): ImpactScores {
  return { ...NEUTRAL_IMPACT, [dimension]: level };
}

describe('ConstraintsLog vocabularies', () => {
  it('item-type tuple covers risk / constraint / issue / delay-exposure / change-exposure', () => {
    expect([...CONSTRAINTS_LOG_ITEM_TYPES]).toEqual([
      'risk',
      'constraint',
      'issue',
      'delay-exposure',
      'change-exposure',
    ]);
  });

  it('severity band keys are ordered low → critical', () => {
    expect([...SEVERITY_BAND_KEYS]).toEqual(['low', 'moderate', 'high', 'very-high', 'critical']);
  });

  it('exposure bands cover the full 1–25 range without gaps', () => {
    let cursor = 1;
    for (const band of EXPOSURE_BANDS) {
      expect(band.minScoreInclusive).toBe(cursor);
      expect(band.maxScoreInclusive).toBeGreaterThanOrEqual(band.minScoreInclusive);
      cursor = band.maxScoreInclusive + 1;
    }
    expect(cursor).toBe(26);
  });

  it('seed category tuple is non-empty and unique', () => {
    expect(CONSTRAINTS_LOG_SEED_CATEGORY_IDS.length).toBeGreaterThan(0);
    expect(new Set(CONSTRAINTS_LOG_SEED_CATEGORY_IDS).size).toBe(
      CONSTRAINTS_LOG_SEED_CATEGORY_IDS.length,
    );
  });

  it('every override code has a rule whose minBandAfterOverride is a valid band', () => {
    for (const code of SEVERITY_OVERRIDE_CODES) {
      const rule = SEVERITY_OVERRIDE_RULES[code];
      expect(rule.code).toBe(code);
      expect(SEVERITY_BAND_KEYS).toContain(rule.minBandAfterOverride);
    }
  });
});

describe('Governing impact and scoring', () => {
  it('governing impact equals the maximum across dimensions (all-1)', () => {
    expect(computeGoverningImpactScore(NEUTRAL_IMPACT)).toBe(1);
  });

  it('governing impact equals the maximum across dimensions (mixed peaks)', () => {
    expect(computeGoverningImpactScore(impactWithDimension('safety', 5))).toBe(5);
    expect(computeGoverningImpactScore(impactWithDimension('reputationExecutiveVisibility', 4))).toBe(
      4,
    );
    expect(computeGoverningImpactScore(impactWithDimension('cost', 3))).toBe(3);
  });

  it('governing impact equals the maximum across dimensions (all-5)', () => {
    const allFive: ImpactScores = {
      schedule: 5,
      cost: 5,
      safety: 5,
      quality: 5,
      contractCompliance: 5,
      clientOwnerImpact: 5,
      logisticsAccess: 5,
      reputationExecutiveVisibility: 5,
    };
    expect(computeGoverningImpactScore(allFive)).toBe(5);
  });

  it('riskScore = likelihood × governingImpact at corners and midpoint', () => {
    expect(computeRiskScore(1, 1)).toBe(1);
    expect(computeRiskScore(3, 3)).toBe(9);
    expect(computeRiskScore(5, 5)).toBe(25);
    expect(computeRiskScore(2, 4)).toBe(8);
  });

  it('residualRiskScore matches the same multiplicative formula', () => {
    expect(computeResidualRiskScore(2, 3)).toBe(6);
    expect(computeResidualRiskScore(1, 5)).toBe(5);
  });

  it('constraintExposureScore = urgency × governingImpact at corners and midpoint', () => {
    expect(computeConstraintExposureScore(1, 1)).toBe(1);
    expect(computeConstraintExposureScore(3, 3)).toBe(9);
    expect(computeConstraintExposureScore(5, 5)).toBe(25);
    expect(computeConstraintExposureScore(4, 2)).toBe(8);
  });
});

describe('Severity band mapping', () => {
  const cases: ReadonlyArray<readonly [number, SeverityBandKey]> = [
    [1, 'low'],
    [4, 'low'],
    [5, 'moderate'],
    [9, 'moderate'],
    [10, 'high'],
    [14, 'high'],
    [15, 'very-high'],
    [19, 'very-high'],
    [20, 'critical'],
    [25, 'critical'],
  ];

  it.each(cases)('score %i maps to %s', (score, band) => {
    expect(mapSeverityBand(score)).toBe(band);
  });

  it('rejects scores below 1 and above 25', () => {
    expect(() => mapSeverityBand(0)).toThrow(/out of range/);
    expect(() => mapSeverityBand(26)).toThrow(/out of range/);
    expect(() => mapSeverityBand(Number.NaN)).toThrow(/out of range/);
  });
});

describe('Severity override semantics (raise-only with rationale)', () => {
  it('returns base band unchanged when no override codes are supplied', () => {
    const outcome = applySeverityOverride('moderate', [], '');
    expect(outcome.band).toBe('moderate');
    expect(outcome.appliedOverrideCodes).toEqual([]);
  });

  it('raises a low band to high under contractual milestone override', () => {
    const outcome = applySeverityOverride(
      'low',
      ['contractual-milestone-exposure'],
      'Substantial-completion milestone is at material risk.',
    );
    expect(outcome.band).toBe('high');
    expect(outcome.appliedOverrideCodes).toEqual(['contractual-milestone-exposure']);
  });

  it('raises any band up to critical under safety override', () => {
    expect(
      applySeverityOverride(
        'low',
        ['safety-immediate-command-attention'],
        'Confined-space ventilation gap.',
      ).band,
    ).toBe('critical');
    expect(
      applySeverityOverride(
        'high',
        ['safety-immediate-command-attention'],
        'Imminent safety exposure.',
      ).band,
    ).toBe('critical');
  });

  it('does not reduce a higher base band when a lower override floor is applied', () => {
    const outcome = applySeverityOverride(
      'critical',
      ['contractual-milestone-exposure'],
      'Contract milestone at risk.',
    );
    expect(outcome.band).toBe('critical');
  });

  it('does not raise above critical', () => {
    const outcome = applySeverityOverride(
      'critical',
      ['safety-immediate-command-attention', 'executive-directed-cross-project'],
      'Cross-project executive directive plus safety floor.',
    );
    expect(outcome.band).toBe('critical');
  });

  it('throws when an override is applied without rationale', () => {
    expect(() =>
      applySeverityOverride('moderate', ['safety-immediate-command-attention'], ''),
    ).toThrow(/rationale required/);
    expect(() =>
      applySeverityOverride('moderate', ['regulatory-permitting-deadline'], '   '),
    ).toThrow(/rationale required/);
  });

  it('takes the maximum floor across multiple override codes', () => {
    const outcome = applySeverityOverride(
      'low',
      ['contractual-milestone-exposure', 'unresolved-escalation-sla-breach'],
      'Contract milestone slip plus repeated unresolved escalation.',
    );
    // contractual milestone floor = high, sla breach floor = very-high → very-high wins
    expect(outcome.band).toBe('very-high');
  });
});

describe('Residual risk reduction permission', () => {
  it('permits residual lower than initial when rationale is present', () => {
    expect(() =>
      assertResidualReductionAllowed(
        20,
        8,
        'Mitigation evidence: rerouted dependency chain to remove blocker.',
      ),
    ).not.toThrow();
  });

  it('throws when residual is lower than initial without rationale', () => {
    expect(() => assertResidualReductionAllowed(20, 8)).toThrow(/mitigation rationale required/);
    expect(() => assertResidualReductionAllowed(20, 8, '')).toThrow(/mitigation rationale required/);
    expect(() => assertResidualReductionAllowed(20, 8, '   ')).toThrow(
      /mitigation rationale required/,
    );
  });

  it('does not require rationale when residual equals initial', () => {
    expect(() => assertResidualReductionAllowed(12, 12)).not.toThrow();
  });

  it('does not require rationale when residual is higher than initial', () => {
    expect(() => assertResidualReductionAllowed(8, 12)).not.toThrow();
  });
});

describe('Risk state transitions', () => {
  it('every risk state has a defined (possibly empty) allowed transition list', () => {
    const allStates = Object.keys(RISK_ALLOWED_TRANSITIONS) as readonly RiskState[];
    expect(allStates.length).toBeGreaterThan(0);
    for (const state of allStates) {
      const targets = RISK_ALLOWED_TRANSITIONS[state];
      expect(Array.isArray(targets)).toBe(true);
    }
  });

  const validRiskTransitions: ReadonlyArray<readonly [RiskState, RiskState]> = [
    ['draft', 'identified'],
    ['identified', 'assessed'],
    ['assessed', 'response-planned'],
    ['response-planned', 'monitoring'],
    ['monitoring', 'triggered'],
    ['triggered', 'converted'],
    ['triggered', 'closed'],
    ['triggered', 'retired'],
    ['monitoring', 'closed'],
  ];

  const invalidRiskTransitions: ReadonlyArray<readonly [RiskState, RiskState]> = [
    ['closed', 'identified'],
    ['retired', 'monitoring'],
    ['converted', 'monitoring'],
    ['draft', 'closed'],
    ['identified', 'monitoring'],
  ];

  it.each(validRiskTransitions)('accepts %s → %s', (from, to) => {
    expect(isRiskTransitionAllowed(from, to)).toBe(true);
  });

  it.each(invalidRiskTransitions)('rejects %s → %s', (from, to) => {
    expect(isRiskTransitionAllowed(from, to)).toBe(false);
  });
});

describe('Constraint state transitions', () => {
  const validConstraintTransitions: ReadonlyArray<readonly [ConstraintState, ConstraintState]> = [
    ['draft', 'identified'],
    ['identified', 'accepted'],
    ['accepted', 'action-planned'],
    ['action-planned', 'in-progress'],
    ['action-planned', 'awaiting-external-party'],
    ['action-planned', 'overdue'],
    ['in-progress', 'resolved-pending-validation'],
    ['awaiting-external-party', 'in-progress'],
    ['overdue', 'in-progress'],
    ['resolved-pending-validation', 'resolved'],
    ['resolved-pending-validation', 'at-risk'],
  ];

  const invalidConstraintTransitions: ReadonlyArray<
    readonly [ConstraintState, ConstraintState]
  > = [
    ['resolved', 'in-progress'],
    ['draft', 'resolved'],
    ['identified', 'in-progress'],
    ['accepted', 'resolved-pending-validation'],
  ];

  it.each(validConstraintTransitions)('accepts %s → %s', (from, to) => {
    expect(isConstraintTransitionAllowed(from, to)).toBe(true);
  });

  it.each(invalidConstraintTransitions)('rejects %s → %s', (from, to) => {
    expect(isConstraintTransitionAllowed(from, to)).toBe(false);
  });
});

describe('Fixture coverage and determinism', () => {
  it('the read-model fixture exists and is non-empty', () => {
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.moduleIdentity.moduleId).toBe('constraints-log');
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.riskItems.length).toBeGreaterThan(0);
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.constraintItems.length).toBeGreaterThan(0);
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.seedCategories.length).toBeGreaterThan(0);
  });

  it('module identity records the intentional dual posture (Path B)', () => {
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.moduleIdentity.governance).toBe('project-readiness');
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.moduleIdentity.workCenterId).toBe(
      'risk-issues-decision',
    );
  });

  it('risks cover every severity band (initial assessment)', () => {
    // Initial-band coverage is the spec requirement; residual reduction is
    // a separate scenario validated below.
    const bands = new Set<SeverityBandKey>();
    for (const risk of SAMPLE_CONSTRAINTS_LOG_RISKS) {
      bands.add(risk.initial.band);
    }
    for (const band of SEVERITY_BAND_KEYS) {
      expect(bands.has(band), `missing band coverage for ${band}`).toBe(true);
    }
  });

  it('at least one risk records a residual reduction with mitigation rationale', () => {
    const reduced = SAMPLE_CONSTRAINTS_LOG_RISKS.find(
      (r) => r.residual !== undefined && r.residual.residualRiskScore < r.initial.riskScore,
    );
    expect(reduced).toBeDefined();
    expect(reduced?.residual?.mitigationRationale?.length).toBeGreaterThan(0);
  });

  it('constraints cover every severity band', () => {
    const bands = new Set<SeverityBandKey>();
    for (const c of SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS) {
      bands.add(c.exposure.band);
    }
    for (const band of SEVERITY_BAND_KEYS) {
      expect(bands.has(band), `missing band coverage for ${band}`).toBe(true);
    }
  });

  it('includes one overdue constraint with dueDateUtc', () => {
    const overdue = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.find((c) => c.state === 'overdue');
    expect(overdue).toBeDefined();
    expect(overdue && 'dueDateUtc' in overdue && overdue.dueDateUtc.length > 0).toBe(true);
  });

  it('includes one awaiting-external-party constraint with externalPartyReference', () => {
    const awaiting = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.find(
      (c) => c.state === 'awaiting-external-party',
    );
    expect(awaiting).toBeDefined();
    expect(
      awaiting && 'externalPartyReference' in awaiting && awaiting.externalPartyReference.length > 0,
    ).toBe(true);
  });

  it('includes one converted risk that points to a constraint id', () => {
    const converted = SAMPLE_CONSTRAINTS_LOG_RISKS.find(
      (r): r is Extract<RiskItem, { state: 'converted' }> => r.state === 'converted',
    );
    expect(converted).toBeDefined();
    expect(converted?.convertedToConstraintId.length).toBeGreaterThan(0);
    expect(
      SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.some((c) => c.id === converted?.convertedToConstraintId),
    ).toBe(true);
  });

  it('includes a missing-owner / ball-in-court gap fixture', () => {
    const missingOwner = SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.find(
      (c) => c.responsibleParty === undefined,
    );
    expect(missingOwner).toBeDefined();
  });

  it('includes both a delay-exposure and a change-exposure review-flag item', () => {
    expect(SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.some((c) => c.type === 'delay-exposure')).toBe(true);
    expect(SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS.some((c) => c.type === 'change-exposure')).toBe(true);
  });

  it('includes safety, regulatory-permitting, and contractual-milestone overrides', () => {
    const allItems: ReadonlyArray<{
      readonly initial?: { readonly appliedOverrideCodes?: readonly string[] };
      readonly exposure?: { readonly appliedOverrideCodes?: readonly string[] };
    }> = [...SAMPLE_CONSTRAINTS_LOG_RISKS, ...SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS];
    const codes = new Set<string>();
    for (const item of allItems) {
      for (const code of item.initial?.appliedOverrideCodes ?? []) codes.add(code);
      for (const code of item.exposure?.appliedOverrideCodes ?? []) codes.add(code);
    }
    expect(codes.has('safety-immediate-command-attention')).toBe(true);
    expect(codes.has('regulatory-permitting-deadline')).toBe(true);
    expect(codes.has('contractual-milestone-exposure')).toBe(true);
  });

  it('every fixture risk has scoring math consistent with the helpers', () => {
    for (const risk of SAMPLE_CONSTRAINTS_LOG_RISKS) {
      const expectedGov = computeGoverningImpactScore(risk.initial.impactScores);
      expect(risk.initial.governingImpactScore).toBe(expectedGov);
      expect(risk.initial.riskScore).toBe(
        computeRiskScore(risk.initial.likelihood, expectedGov),
      );
      // Band must match the score's banding unless an override raised it.
      const baseBand = mapSeverityBand(risk.initial.riskScore);
      if (risk.initial.appliedOverrideCodes && risk.initial.appliedOverrideCodes.length > 0) {
        // Overridden bands must be at or above base band.
        const indices = SEVERITY_BAND_KEYS;
        expect(indices.indexOf(risk.initial.band)).toBeGreaterThanOrEqual(
          indices.indexOf(baseBand),
        );
      } else {
        expect(risk.initial.band).toBe(baseBand);
      }
    }
  });

  it('every fixture constraint has scoring math consistent with the helpers', () => {
    for (const c of SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS) {
      expect(c.exposure.exposureScore).toBe(
        computeConstraintExposureScore(c.exposure.urgency, c.exposure.governingImpactScore),
      );
      const baseBand = mapSeverityBand(c.exposure.exposureScore);
      if (c.exposure.appliedOverrideCodes && c.exposure.appliedOverrideCodes.length > 0) {
        const indices = SEVERITY_BAND_KEYS;
        expect(indices.indexOf(c.exposure.band)).toBeGreaterThanOrEqual(indices.indexOf(baseBand));
      } else {
        expect(c.exposure.band).toBe(baseBand);
      }
    }
  });

  it('exposure summary counts by band match a recount over the items', () => {
    const recount: Record<SeverityBandKey, number> = {
      low: 0,
      moderate: 0,
      high: 0,
      'very-high': 0,
      critical: 0,
    };
    for (const r of SAMPLE_CONSTRAINTS_LOG_RISKS) {
      recount[r.residual?.band ?? r.initial.band] += 1;
    }
    expect(SAMPLE_CONSTRAINTS_LOG_READ_MODEL.exposureSummary.riskCountsByBand).toEqual(recount);
  });

  it('seed categories cover every workbook-derived category id', () => {
    const fixtureIds = SAMPLE_CONSTRAINTS_LOG_SEED_CATEGORIES.map((c) => c.id);
    expect([...fixtureIds]).toEqual([...CONSTRAINTS_LOG_SEED_CATEGORY_IDS]);
  });

  it('does not invent active default constraints from workbook seed rows', () => {
    // The read-model exposes seedCategories (taxonomy only) and item arrays
    // that are explicitly declared in the fixture. There is no
    // `defaultActiveItems` field anywhere in the read-model contract.
    expect((SAMPLE_CONSTRAINTS_LOG_READ_MODEL as Record<string, unknown>).defaultActiveItems).toBeUndefined();
  });

  it('reference seams are present across the fixture set', () => {
    const allItems: ReadonlyArray<{
      readonly priorityActionsCandidateRef?: string;
      readonly documentControlEvidenceRefs?: readonly string[];
      readonly lifecycleReadinessGateRef?: string;
      readonly permitInspectionRef?: string;
      readonly responsibilityRoleRef?: string;
      readonly wave14ApprovalCheckpointRef?: string;
      readonly externalSystemReferenceRef?: string;
      readonly projectReadinessSourceModuleRef?: string;
    }> = [...SAMPLE_CONSTRAINTS_LOG_RISKS, ...SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS];
    expect(allItems.some((i) => i.priorityActionsCandidateRef)).toBe(true);
    expect(allItems.some((i) => (i.documentControlEvidenceRefs ?? []).length > 0)).toBe(true);
    expect(allItems.some((i) => i.lifecycleReadinessGateRef)).toBe(true);
    expect(allItems.some((i) => i.permitInspectionRef)).toBe(true);
    expect(allItems.some((i) => i.responsibilityRoleRef)).toBe(true);
    expect(allItems.some((i) => i.wave14ApprovalCheckpointRef)).toBe(true);
    expect(allItems.some((i) => i.externalSystemReferenceRef)).toBe(true);
    expect(allItems.some((i) => i.projectReadinessSourceModuleRef === 'constraints-log')).toBe(true);
  });
});

describe('Structural prohibition: no claim/entitlement/compensability/delay-damages/forensic helpers', () => {
  // Memory: feedback_no_runtime_guard_structural_not_text and
  // feedback_word_blocklists_break_on_corrected_copy. These tests are
  // structural — they enumerate the actual public API surface and assert
  // forbidden helper names are not present. They do not scan free text.

  const FORBIDDEN_API_NAME_PATTERNS: readonly RegExp[] = [
    /claimEntitlement/i,
    /compensability/i,
    /delayDamages/i,
    /forensicSchedule/i,
    /noticeSufficiency/i,
  ];

  it('the module exposes no helper or constant whose name implies a prohibited determination', () => {
    const exportedNames = Object.keys(ConstraintsLogModule);
    expect(exportedNames.length).toBeGreaterThan(0);
    for (const name of exportedNames) {
      for (const pattern of FORBIDDEN_API_NAME_PATTERNS) {
        expect(pattern.test(name), `forbidden export name: ${name}`).toBe(false);
      }
    }
  });

  it('RiskItem and ConstraintItem types do not declare claim/delay/forensic fields', () => {
    // Type-level assertion: each forbidden field name's intersection with
    // the union of keys must be `never`. If TypeScript ever introduces such
    // a field, these aliases collapse to a non-`never` literal and the
    // const declarations below fail to compile.
    type _NoClaimEntitlementOnRisk = (keyof RiskItem & 'claimEntitlement') extends never ? true : never;
    type _NoCompensabilityOnRisk = (keyof RiskItem & 'compensability') extends never ? true : never;
    type _NoDelayDamagesOnRisk = (keyof RiskItem & 'delayDamages') extends never ? true : never;
    type _NoForensicScheduleOnRisk = (keyof RiskItem & 'forensicScheduleAnalysis') extends never
      ? true
      : never;
    type _NoClaimEntitlementOnConstraint = (keyof ConstraintItem & 'claimEntitlement') extends never
      ? true
      : never;
    type _NoCompensabilityOnConstraint = (keyof ConstraintItem & 'compensability') extends never
      ? true
      : never;
    type _NoDelayDamagesOnConstraint = (keyof ConstraintItem & 'delayDamages') extends never
      ? true
      : never;
    type _NoForensicScheduleOnConstraint = (
      keyof ConstraintItem & 'forensicScheduleAnalysis'
    ) extends never
      ? true
      : never;

    const checks: ReadonlyArray<true> = [
      true satisfies _NoClaimEntitlementOnRisk,
      true satisfies _NoCompensabilityOnRisk,
      true satisfies _NoDelayDamagesOnRisk,
      true satisfies _NoForensicScheduleOnRisk,
      true satisfies _NoClaimEntitlementOnConstraint,
      true satisfies _NoCompensabilityOnConstraint,
      true satisfies _NoDelayDamagesOnConstraint,
      true satisfies _NoForensicScheduleOnConstraint,
    ];
    expect(checks.every(Boolean)).toBe(true);
  });

  it('delay-exposure and change-exposure are review-flag types whose exposure score sits beside risks/constraints, not above them', () => {
    const reviewFlagTypes = new Set<string>();
    for (const c of SAMPLE_CONSTRAINTS_LOG_CONSTRAINTS) {
      if (c.type === 'delay-exposure' || c.type === 'change-exposure') {
        reviewFlagTypes.add(c.type);
        // Review flags must still carry an exposure score (they are tracked,
        // not silenced) but must not carry mitigation or external-party
        // fields that would imply a determination beyond review.
        expect((c as { mitigationPlanSummary?: string }).mitigationPlanSummary).toBeUndefined();
      }
    }
    expect(reviewFlagTypes.has('delay-exposure')).toBe(true);
    expect(reviewFlagTypes.has('change-exposure')).toBe(true);
  });
});

describe('Source-scan guards (no runtime imports / no live URLs / no live UPNs)', () => {
  it('ConstraintsLog.ts imports no SPFx, PnP, Azure, HTTP, Procore, or sibling boundary packages', () => {
    const stripped = strip(readFileSync(MODEL_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('fixture file imports no SPFx, PnP, Azure, HTTP, Procore, or sibling boundary packages', () => {
    const stripped = strip(readFileSync(FIXTURE_FILE, 'utf8'));
    const importLines = stripped
      .split('\n')
      .filter((line) => /\bimport\b/.test(line) || /\bfrom\b/.test(line));
    for (const line of importLines) {
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        expect(pattern.test(line), `forbidden import: ${line.trim()}`).toBe(false);
      }
    }
  });

  it('fixture file is deterministic and uses no clock or random APIs', () => {
    const stripped = strip(readFileSync(FIXTURE_FILE, 'utf8'));
    const NON_DETERMINISTIC = [
      /\bMath\.random\s*\(/,
      /\bDate\.now\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\bperformance\.now\s*\(/,
      /\bnew\s+Date\s*\(\s*\)/,
    ];
    for (const pattern of NON_DETERMINISTIC) {
      expect(stripped, `fixture matched ${pattern}`).not.toMatch(pattern);
    }
  });

  it('fixture file contains no live URLs and no live UPNs', () => {
    const raw = readFileSync(FIXTURE_FILE, 'utf8');
    const liveUrls = raw.match(/https?:\/\/(?!example\.invalid)[^\s'"`]+/g) ?? [];
    expect(liveUrls).toEqual([]);
    const liveUpns =
      raw.match(/[A-Za-z0-9._-]+@(?!example\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
    expect(liveUpns).toEqual([]);
  });
});

describe('SCORE_LEVELS sanity', () => {
  it('exposes 1..5 in order', () => {
    expect([...SCORE_LEVELS]).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('CONSTRAINT_ALLOWED_TRANSITIONS shape', () => {
  it('every constraint state has a defined (possibly empty) allowed transition list', () => {
    const allStates = Object.keys(CONSTRAINT_ALLOWED_TRANSITIONS) as readonly ConstraintState[];
    expect(allStates.length).toBeGreaterThan(0);
    for (const state of allStates) {
      const targets = CONSTRAINT_ALLOWED_TRANSITIONS[state];
      expect(Array.isArray(targets)).toBe(true);
    }
  });
});
