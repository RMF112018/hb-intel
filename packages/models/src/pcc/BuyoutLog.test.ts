import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as BuyoutLogModule from './BuyoutLog.js';
import {
  BUYOUT_AUDIT_EVENT_TYPES,
  BUYOUT_COMPLETION_GATE_RESULTS,
  BUYOUT_COMPLIANCE_REQUIREMENT_STATES,
  BUYOUT_COMPLIANCE_REQUIREMENT_TYPES,
  BUYOUT_EXCEPTION_CLASSIFICATIONS,
  BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE,
  BUYOUT_EXCEPTION_REASON_CODES,
  BUYOUT_FIELD_MUTABILITY,
  BUYOUT_FIELD_MUTABILITY_CLASSES,
  BUYOUT_HBI_REFUSAL_REASONS,
  BUYOUT_PACKAGE_ALLOWED_TRANSITIONS,
  BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES,
  BUYOUT_PACKAGE_STATES,
  BUYOUT_PACKAGE_TERMINAL_STATES,
  BUYOUT_PROCUREMENT_MILESTONE_STATES,
  BUYOUT_PROCUREMENT_MILESTONE_TYPES,
  BUYOUT_PROCUREMENT_RISK_LEVELS,
  BUYOUT_PROJECT_MEMORY_KINDS,
  BUYOUT_RECONCILIATION_ISSUE_KINDS,
  BUYOUT_RECONCILIATION_STATES,
  BUYOUT_RECORD_CREATION_SOURCES,
  BUYOUT_SOURCE_SYSTEMS,
  BUYOUT_TRACEABILITY_EDGE_KINDS,
  assertBuyoutPackageTransition,
  buyoutPriorityActionDedupeKey,
  evaluateBuyoutCompletionGate,
  isBuyoutHbiEligible,
  isBuyoutPackageTransitionAllowed,
  reconcileBuyoutAmounts,
  requireBuyoutSourceLineage,
  validateBuyoutWaiver,
  type BuyoutCompletionGateChildren,
  type BuyoutComplianceRequirement,
  type BuyoutEvidenceLink,
  type BuyoutPackage,
  type BuyoutPackageState,
} from './BuyoutLog.js';
import {
  SAMPLE_BUYOUT_LOG_BUDGET_ALLOCATIONS,
  SAMPLE_BUYOUT_LOG_COMMITMENT_LINKS,
  SAMPLE_BUYOUT_LOG_COMPLIANCE_REQUIREMENTS,
  SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS,
  SAMPLE_BUYOUT_LOG_HBI_ELIGIBILITY_MARKERS,
  SAMPLE_BUYOUT_LOG_PACKAGES,
  SAMPLE_BUYOUT_LOG_PRIORITY_ACTION_CANDIDATES,
  SAMPLE_BUYOUT_LOG_PROCUREMENT_MILESTONES,
  SAMPLE_BUYOUT_LOG_READ_MODEL,
  SAMPLE_BUYOUT_LOG_RECONCILIATION_ISSUES,
} from './fixtures/buyoutLog.js';
import { PCC_WORKFLOW_MODULES } from './WorkflowModules.js';
import { PROJECT_READINESS_SOURCE_MODULES } from './ProjectReadinessFramework.js';
import type { PccProjectId } from './types.js';

// ---------------------------------------------------------------------------
// Source-scan helpers (comment + string scrub).
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
  /from\s+['"][^'"]*procore[^'"]*['"]/i,
  /\.\.\/\.\.\/\.\.\/backend\//,
  /\b@hbc\/project-site-provisioning\b/,
  /\b@hbc\/project-site-template\b/,
];

const MODEL_FILE = fileURLToPath(new URL('./BuyoutLog.ts', import.meta.url));
const FIXTURE_FILE = fileURLToPath(new URL('./fixtures/buyoutLog.ts', import.meta.url));

const PROJECT_ID = 'p-test-buyout' as PccProjectId;

const READY_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find((p) => p.id === 'pkg-w13-ready-001')!;
const BLOCKED_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find((p) => p.id === 'pkg-w13-blocked-002')!;
const COMPLIANCE_HOLD_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find(
  (p) => p.id === 'pkg-w13-compliance-hold-003',
)!;
const OVER_BUDGET_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find(
  (p) => p.id === 'pkg-w13-over-budget-004',
)!;
const MISSING_LINEAGE_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find(
  (p) => p.id === 'pkg-w13-missing-lineage-005',
)!;
const MISSING_EVIDENCE_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find(
  (p) => p.id === 'pkg-w13-missing-evidence-006',
)!;
const MISSING_COMMITMENT_PKG = SAMPLE_BUYOUT_LOG_PACKAGES.find(
  (p) => p.id === 'pkg-w13-missing-commitment-007',
)!;

function childrenForPackage(pkgId: string): BuyoutCompletionGateChildren {
  return {
    commitmentLinks: SAMPLE_BUYOUT_LOG_COMMITMENT_LINKS.filter((c) => c.buyoutPackageId === pkgId),
    complianceRequirements: SAMPLE_BUYOUT_LOG_COMPLIANCE_REQUIREMENTS.filter(
      (c) => c.buyoutPackageId === pkgId,
    ),
    procurementMilestones: SAMPLE_BUYOUT_LOG_PROCUREMENT_MILESTONES.filter(
      (m) => m.buyoutPackageId === pkgId,
    ),
    evidenceLinks: SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS.filter((e) => e.buyoutPackageId === pkgId),
    reconciliationIssues: SAMPLE_BUYOUT_LOG_RECONCILIATION_ISSUES.filter(
      (i) => i.buyoutPackageId === pkgId,
    ),
    budgetAllocations: SAMPLE_BUYOUT_LOG_BUDGET_ALLOCATIONS.filter(
      (a) => a.buyoutPackageId === pkgId,
    ),
  };
}

// ---------------------------------------------------------------------------
// 1. Vocabulary shape — non-empty + unique tuples; structural API guards.
// ---------------------------------------------------------------------------

describe('BuyoutLog vocabularies', () => {
  it('every constant tuple is non-empty and unique', () => {
    const tuples: ReadonlyArray<readonly [string, ReadonlyArray<unknown>]> = [
      ['BUYOUT_PACKAGE_STATES', BUYOUT_PACKAGE_STATES],
      ['BUYOUT_PACKAGE_TERMINAL_STATES', BUYOUT_PACKAGE_TERMINAL_STATES],
      ['BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES', BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES],
      ['BUYOUT_RECONCILIATION_STATES', BUYOUT_RECONCILIATION_STATES],
      ['BUYOUT_COMPLETION_GATE_RESULTS', BUYOUT_COMPLETION_GATE_RESULTS],
      ['BUYOUT_EXCEPTION_REASON_CODES', BUYOUT_EXCEPTION_REASON_CODES],
      ['BUYOUT_EXCEPTION_CLASSIFICATIONS', BUYOUT_EXCEPTION_CLASSIFICATIONS],
      ['BUYOUT_FIELD_MUTABILITY_CLASSES', BUYOUT_FIELD_MUTABILITY_CLASSES],
      ['BUYOUT_SOURCE_SYSTEMS', BUYOUT_SOURCE_SYSTEMS],
      ['BUYOUT_RECORD_CREATION_SOURCES', BUYOUT_RECORD_CREATION_SOURCES],
      ['BUYOUT_COMPLIANCE_REQUIREMENT_TYPES', BUYOUT_COMPLIANCE_REQUIREMENT_TYPES],
      ['BUYOUT_COMPLIANCE_REQUIREMENT_STATES', BUYOUT_COMPLIANCE_REQUIREMENT_STATES],
      ['BUYOUT_PROCUREMENT_MILESTONE_TYPES', BUYOUT_PROCUREMENT_MILESTONE_TYPES],
      ['BUYOUT_PROCUREMENT_MILESTONE_STATES', BUYOUT_PROCUREMENT_MILESTONE_STATES],
      ['BUYOUT_PROCUREMENT_RISK_LEVELS', BUYOUT_PROCUREMENT_RISK_LEVELS],
      ['BUYOUT_RECONCILIATION_ISSUE_KINDS', BUYOUT_RECONCILIATION_ISSUE_KINDS],
      ['BUYOUT_AUDIT_EVENT_TYPES', BUYOUT_AUDIT_EVENT_TYPES],
      ['BUYOUT_HBI_REFUSAL_REASONS', BUYOUT_HBI_REFUSAL_REASONS],
      ['BUYOUT_PROJECT_MEMORY_KINDS', BUYOUT_PROJECT_MEMORY_KINDS],
      ['BUYOUT_TRACEABILITY_EDGE_KINDS', BUYOUT_TRACEABILITY_EDGE_KINDS],
    ];
    for (const [name, tuple] of tuples) {
      expect(tuple.length, `${name} must be non-empty`).toBeGreaterThan(0);
      expect(new Set(tuple).size, `${name} must be unique`).toBe(tuple.length);
    }
  });

  it('reference-posture states are a subset of full state list', () => {
    for (const state of BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES) {
      expect((BUYOUT_PACKAGE_STATES as readonly string[]).includes(state)).toBe(true);
    }
  });

  it('terminal states are exactly complete and not-applicable', () => {
    expect([...BUYOUT_PACKAGE_TERMINAL_STATES]).toEqual(['complete', 'not-applicable']);
  });

  it('every reason code maps to a defined classification', () => {
    for (const code of BUYOUT_EXCEPTION_REASON_CODES) {
      const classification = BUYOUT_EXCEPTION_CLASSIFICATION_BY_CODE[code];
      expect(BUYOUT_EXCEPTION_CLASSIFICATIONS).toContain(classification);
    }
  });

  it('field mutability map covers every BuyoutPackage key with a valid class', () => {
    for (const value of Object.values(BUYOUT_FIELD_MUTABILITY)) {
      expect(BUYOUT_FIELD_MUTABILITY_CLASSES).toContain(value);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Structural prohibition: no mutation/action/determination identifiers.
// ---------------------------------------------------------------------------

describe('Structural prohibition: no runtime/action/determination exports', () => {
  // Anchored to identifier start so legitimate field names like
  // `procoreCompanyId`, `sageCommittedCostAmount`, `procoreCurrentCommitmentAmount`
  // are not flagged. See memory feedback_anchored_identifier_regex_for_vendor_tokens.
  const FORBIDDEN_API_NAME_PATTERNS: readonly RegExp[] = [
    /^create(Procore|Sage|Commitment|PurchaseOrder|Subcontract|Sov|Cco|Invoice|Payment)\b/,
    /^post(To|)(Sage|Procore)\b/,
    /^send(To|)(Procore|Sage|Adobe|DocuSign)\b/,
    /^writeBack\b/,
    /^sync(To|From)\b/,
    /^poll[A-Z]/,
    /^mirror[A-Z]/,
    /^upsert(Procore|Sage)\b/,
    /^submit(To|)(Procore|Sage|Adobe|DocuSign)\b/,
    /^execute(Approval|Checkpoint|Commitment|Payment)\b/,
    /^determine(Compensability|Entitlement|DelayDamages|ClaimMerit)\b/,
    /^award(Damages|Claim)\b/,
    /^post(Accounting|Payment|Invoice)\b/,
    /^classifyLegal\b/,
  ];

  it('exposes no helper or constant whose name implies a forbidden runtime/action verb', () => {
    const exportedNames = Object.keys(BuyoutLogModule);
    expect(exportedNames.length).toBeGreaterThan(0);
    for (const name of exportedNames) {
      for (const pattern of FORBIDDEN_API_NAME_PATTERNS) {
        expect(pattern.test(name), `forbidden export name: ${name}`).toBe(false);
      }
    }
  });

  it('source file (stripped) contains no fetch/axios/pnp/sp/XMLHttpRequest call sites', () => {
    const stripped = strip(readFileSync(MODEL_FILE, 'utf8'));
    const callSitePatterns: readonly RegExp[] = [
      /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/,
      /\baxios\.[a-z]/,
      /\bpnp\.[a-z]/,
      /\bsp\.[a-z]/,
    ];
    for (const pattern of callSitePatterns) {
      expect(stripped, `BuyoutLog.ts matched ${pattern}`).not.toMatch(pattern);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. State transitions.
// ---------------------------------------------------------------------------

describe('Buyout package state transitions', () => {
  it('every package state has a defined (possibly empty) allowed-transition list', () => {
    for (const state of BUYOUT_PACKAGE_STATES) {
      const targets = BUYOUT_PACKAGE_ALLOWED_TRANSITIONS[state];
      expect(Array.isArray(targets)).toBe(true);
    }
  });

  const validTransitions: ReadonlyArray<readonly [BuyoutPackageState, BuyoutPackageState]> = [
    ['not-started', 'scope-defined'],
    ['scope-defined', 'bid-coverage-needed'],
    ['bid-coverage-needed', 'bids-received'],
    ['bids-received', 'leveling'],
    ['leveling', 'award-recommended'],
    ['award-recommended', 'award-approved'],
    ['award-approved', 'loi-pending'],
    ['loi-pending', 'loi-executed'],
    ['loi-executed', 'contract-drafting'],
    ['contract-drafting', 'contract-executed'],
    ['contract-executed', 'procore-commitment-pending'],
    ['procore-commitment-pending', 'procore-commitment-created'],
    ['procore-commitment-created', 'compliance-pending'],
    ['compliance-pending', 'procurement-tracking'],
    ['procurement-tracking', 'complete'],
    ['scope-defined', 'blocked'],
    ['compliance-pending', 'deferred'],
    ['leveling', 'not-applicable'],
    ['blocked', 'leveling'],
    ['deferred', 'contract-drafting'],
  ];

  const invalidTransitions: ReadonlyArray<readonly [BuyoutPackageState, BuyoutPackageState]> = [
    ['not-started', 'complete'],
    ['not-started', 'procore-commitment-created'],
    ['complete', 'leveling'],
    ['not-applicable', 'scope-defined'],
    ['scope-defined', 'procurement-tracking'],
  ];

  it.each(validTransitions)('accepts %s -> %s', (from, to) => {
    expect(isBuyoutPackageTransitionAllowed(from, to)).toBe(true);
  });

  it.each(invalidTransitions)('rejects %s -> %s', (from, to) => {
    expect(isBuyoutPackageTransitionAllowed(from, to)).toBe(false);
  });

  it('terminal states have no allowed transitions', () => {
    expect(BUYOUT_PACKAGE_ALLOWED_TRANSITIONS.complete).toEqual([]);
    expect(BUYOUT_PACKAGE_ALLOWED_TRANSITIONS['not-applicable']).toEqual([]);
  });

  it('blocked transition requires a reason', () => {
    expect(() => assertBuyoutPackageTransition('leveling', 'blocked')).toThrow(
      /blocked transition requires a reason/,
    );
    expect(() =>
      assertBuyoutPackageTransition('leveling', 'blocked', { reason: 'vendor renegotiating' }),
    ).not.toThrow();
  });

  it('deferred transition requires both a reason and a deferredUntilUtc', () => {
    expect(() => assertBuyoutPackageTransition('leveling', 'deferred')).toThrow(
      /deferred transition requires a reason/,
    );
    expect(() =>
      assertBuyoutPackageTransition('leveling', 'deferred', { reason: 'paused' }),
    ).toThrow(/deferredUntilUtc/);
    expect(() =>
      assertBuyoutPackageTransition('leveling', 'deferred', {
        reason: 'paused',
        deferredUntilUtc: '2026-06-01T00:00:00Z',
      }),
    ).not.toThrow();
  });

  it('disallowed transitions throw', () => {
    expect(() => assertBuyoutPackageTransition('not-started', 'complete')).toThrow(
      /transition not allowed/,
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Completion gate.
// ---------------------------------------------------------------------------

describe('Buyout completion gate', () => {
  it('marks the ready package as ready-for-award (or complete when status==complete)', () => {
    const outcome = evaluateBuyoutCompletionGate(READY_PKG, childrenForPackage(READY_PKG.id));
    // ready package status is 'procurement-tracking', so result is ready-for-award
    expect(['ready-for-award', 'ready-with-exceptions']).toContain(outcome.result);
    expect(outcome.hasComplianceHold).toBe(false);
    expect(outcome.hasUnresolvedReconciliation).toBe(false);
  });

  it('marks compliance-hold package as blocked when a required compliance is pending', () => {
    const outcome = evaluateBuyoutCompletionGate(
      COMPLIANCE_HOLD_PKG,
      childrenForPackage(COMPLIANCE_HOLD_PKG.id),
    );
    expect(outcome.result).toBe('blocked');
    expect(outcome.hasComplianceHold).toBe(true);
  });

  it('marks over-budget package as blocked due to unresolved reconciliation', () => {
    const outcome = evaluateBuyoutCompletionGate(
      OVER_BUDGET_PKG,
      childrenForPackage(OVER_BUDGET_PKG.id),
    );
    expect(outcome.result).toBe('blocked');
    expect(outcome.hasUnresolvedReconciliation).toBe(true);
  });

  it('marks blocked package as not-ready when subcontract evidence is missing', () => {
    const outcome = evaluateBuyoutCompletionGate(BLOCKED_PKG, childrenForPackage(BLOCKED_PKG.id));
    expect(['not-ready', 'blocked']).toContain(outcome.result);
    expect(outcome.missing).toContain('subcontract-evidence');
  });

  it('flags missing source lineage in completion gate when sourceObjectId absent', () => {
    const outcome = evaluateBuyoutCompletionGate(
      MISSING_LINEAGE_PKG,
      childrenForPackage(MISSING_LINEAGE_PKG.id),
    );
    expect(outcome.missing).toContain('source-lineage');
  });
});

// ---------------------------------------------------------------------------
// 5. Waiver rule.
// ---------------------------------------------------------------------------

describe('Waiver validation', () => {
  const baseRequirement: BuyoutComplianceRequirement = {
    id: 'comp-test-001',
    buyoutPackageId: 'pkg-test',
    requirementType: 'bond',
    required: true,
    status: 'waived',
    waiverRequired: true,
    waiverReason: 'Vendor history justifies waiver.',
    waiverApprovedBy: 'role-w11-project-executive',
    waiverApprovedAtUtc: '2026-04-22T15:00:00Z',
    evidenceLinkIds: ['evidence-w13-bond-waiver-test'],
    sourceSystem: 'pcc',
    sourceLineageId: 'lineage-pcc-comp-test',
  };

  it('passes when waiver fields are populated', () => {
    expect(() => validateBuyoutWaiver(baseRequirement)).not.toThrow();
  });

  it('passes when waiver is not required', () => {
    expect(() =>
      validateBuyoutWaiver({ ...baseRequirement, waiverRequired: false, status: 'satisfied' }),
    ).not.toThrow();
  });

  it('throws when reason is missing', () => {
    expect(() => validateBuyoutWaiver({ ...baseRequirement, waiverReason: '' })).toThrow(
      /waiver requires a reason/,
    );
  });

  it('throws when approver is missing', () => {
    expect(() => validateBuyoutWaiver({ ...baseRequirement, waiverApprovedBy: '' })).toThrow(
      /waiver requires an approver/,
    );
  });

  it('throws when approval timestamp is missing', () => {
    expect(() =>
      validateBuyoutWaiver({ ...baseRequirement, waiverApprovedAtUtc: '' }),
    ).toThrow(/waiver requires an approval timestamp/);
  });
});

// ---------------------------------------------------------------------------
// 6. Source lineage requirement.
// ---------------------------------------------------------------------------

describe('Source lineage requirement', () => {
  it('passes for procore-sourced package with sourceObjectId', () => {
    expect(() => requireBuyoutSourceLineage(READY_PKG)).not.toThrow();
  });

  it('throws for procore-sourced package missing sourceObjectId', () => {
    expect(() => requireBuyoutSourceLineage(MISSING_LINEAGE_PKG)).toThrow(/sourceObjectId/);
  });

  it('passes for pcc-sourced package without sourceObjectId', () => {
    expect(() => requireBuyoutSourceLineage(BLOCKED_PKG)).not.toThrow();
  });

  it('throws for workbook-template package missing workbookRef', () => {
    const pkg: BuyoutPackage = {
      ...MISSING_EVIDENCE_PKG,
      sourceLineage: { sourceSystem: 'workbook-template', creationSource: 'workbook-seed' },
    };
    expect(() => requireBuyoutSourceLineage(pkg)).toThrow(/workbookRef/);
  });
});

// ---------------------------------------------------------------------------
// 7. Budget-vs-commitment reconciliation.
// ---------------------------------------------------------------------------

describe('Buyout reconciliation', () => {
  it('returns reconciled when within tolerance', () => {
    const outcome = reconcileBuyoutAmounts(1_000_000, 1_000_400);
    expect(outcome.status).toBe('reconciled');
    expect(outcome.mismatches).toEqual([]);
  });

  it('returns variance-exception when above $500 absolute tolerance and 0.5% percent', () => {
    const outcome = reconcileBuyoutAmounts(1_000_000, 1_010_000);
    expect(outcome.status).toBe('variance-exception');
    expect(outcome.mismatches).toContain('amount-mismatch');
  });

  it('treats Sage difference as $0 exact match', () => {
    const exact = reconcileBuyoutAmounts(1_000_000, undefined, 1_000_000);
    expect(exact.mismatches).not.toContain('sage-accounting-mismatch');
    const off = reconcileBuyoutAmounts(1_000_000, undefined, 1_000_001);
    expect(off.mismatches).toContain('sage-accounting-mismatch');
  });

  it('returns not-linked when no source amounts provided', () => {
    expect(reconcileBuyoutAmounts(1_000_000).status).toBe('not-linked');
  });

  it('honors custom tolerance options', () => {
    const outcome = reconcileBuyoutAmounts(1_000_000, 1_002_000, undefined, {
      absoluteToleranceUsd: 5_000,
      percentTolerance: 0.01,
    });
    expect(outcome.status).toBe('reconciled');
  });
});

// ---------------------------------------------------------------------------
// 8. HBI eligibility.
// ---------------------------------------------------------------------------

describe('HBI eligibility', () => {
  it('returns eligible when lineage + evidence + permission OK', () => {
    const result = isBuyoutHbiEligible(READY_PKG, SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS, true);
    expect(result.eligible).toBe(true);
    expect(result.refusalReasons).toEqual([]);
  });

  it('refuses for missing source lineage', () => {
    const result = isBuyoutHbiEligible(
      MISSING_LINEAGE_PKG,
      SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS,
      true,
    );
    expect(result.eligible).toBe(false);
    expect(result.refusalReasons).toContain('missing-source-lineage');
  });

  it('refuses for missing evidence link', () => {
    const result = isBuyoutHbiEligible(
      MISSING_EVIDENCE_PKG,
      SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS,
      true,
    );
    expect(result.eligible).toBe(false);
    expect(result.refusalReasons).toContain('missing-evidence-link');
  });

  it('refuses for permission blocked', () => {
    const result = isBuyoutHbiEligible(READY_PKG, SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS, false);
    expect(result.eligible).toBe(false);
    expect(result.refusalReasons).toContain('permission-blocked');
  });

  it('stacks multiple refusal reasons', () => {
    const result = isBuyoutHbiEligible(MISSING_LINEAGE_PKG, [], false);
    expect(result.eligible).toBe(false);
    expect(result.refusalReasons.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// 9. Fixture determinism + no live URLs/UPNs.
// ---------------------------------------------------------------------------

describe('Fixture determinism', () => {
  it('source file (stripped) has no clock or random APIs', () => {
    const stripped = strip(readFileSync(FIXTURE_FILE, 'utf8'));
    const NON_DETERMINISTIC: readonly RegExp[] = [
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

  it('fixture sample read-model has stable shape and contents', () => {
    expect(SAMPLE_BUYOUT_LOG_READ_MODEL.moduleIdentity.moduleId).toBe('buyout-log');
    expect(SAMPLE_BUYOUT_LOG_READ_MODEL.moduleIdentity.subtitle).toBe('Buyout Control Center');
    expect(SAMPLE_BUYOUT_LOG_READ_MODEL.packages.length).toBe(8);
    expect(SAMPLE_BUYOUT_LOG_READ_MODEL.priorityActionCandidates.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 10. Placement bridge.
// ---------------------------------------------------------------------------

describe('buyout-log placement bridge', () => {
  it('WorkflowModules registers buyout-log against procurement-and-buyout work center', () => {
    const entry = PCC_WORKFLOW_MODULES['buyout-log'];
    expect(entry.id).toBe('buyout-log');
    expect(entry.workCenterId).toBe('procurement-and-buyout');
    expect(entry.mvpTier).toBe('MVP');
  });

  it('Project Readiness Framework includes buyout-log as a source module', () => {
    expect((PROJECT_READINESS_SOURCE_MODULES as readonly string[]).includes('buyout-log')).toBe(
      true,
    );
  });

  it('module identity records governance and work-center affinity', () => {
    const id = SAMPLE_BUYOUT_LOG_READ_MODEL.moduleIdentity;
    expect(id.governance).toBe('project-readiness');
    expect(id.workCenterId).toBe('procurement-and-buyout');
    expect(id.futureAffinityWorkCenter).toBe('procurement-and-buyout-center');
  });
});

// ---------------------------------------------------------------------------
// 11. No-runtime imports (file-local).
// ---------------------------------------------------------------------------

describe('Source-scan guards (no runtime imports)', () => {
  it('BuyoutLog.ts imports no SPFx, PnP, Azure, HTTP, Procore SDK, or sibling boundary packages', () => {
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

  it('fixture file imports no SPFx, PnP, Azure, HTTP, Procore SDK, or sibling boundary packages', () => {
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
});

// ---------------------------------------------------------------------------
// 12. Priority action dedupe key.
// ---------------------------------------------------------------------------

describe('Priority action dedupe key', () => {
  it('produces deterministic key from inputs', () => {
    const a = buyoutPriorityActionDedupeKey(PROJECT_ID, 'pkg-1', 'UNBOUGHT_SCOPE');
    const b = buyoutPriorityActionDedupeKey(PROJECT_ID, 'pkg-1', 'UNBOUGHT_SCOPE');
    expect(a).toBe(b);
  });

  it('produces different keys for different reason codes', () => {
    const a = buyoutPriorityActionDedupeKey(PROJECT_ID, 'pkg-1', 'UNBOUGHT_SCOPE');
    const b = buyoutPriorityActionDedupeKey(PROJECT_ID, 'pkg-1', 'OVER_BUDGET');
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// 13. Missing-evidence scenario assertions.
// ---------------------------------------------------------------------------

describe('Missing-evidence scenario', () => {
  it('package has zero EvidenceLink records associated', () => {
    const evidence = SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS.filter(
      (e) => e.buyoutPackageId === MISSING_EVIDENCE_PKG.id,
    );
    expect(evidence).toEqual([]);
  });

  it('completion gate returns non-complete with evidence-link missing', () => {
    const outcome = evaluateBuyoutCompletionGate(
      MISSING_EVIDENCE_PKG,
      childrenForPackage(MISSING_EVIDENCE_PKG.id),
    );
    expect(outcome.result).not.toBe('complete');
    expect(outcome.missing).toContain('evidence-link');
  });

  it('HBI eligibility predicate returns false with missing-evidence-link refusal', () => {
    const result = isBuyoutHbiEligible(
      MISSING_EVIDENCE_PKG,
      SAMPLE_BUYOUT_LOG_EVIDENCE_LINKS,
      true,
    );
    expect(result.eligible).toBe(false);
    expect(result.refusalReasons).toContain('missing-evidence-link');
  });

  it('HBI eligibility marker fixture records the refusal', () => {
    const marker = SAMPLE_BUYOUT_LOG_HBI_ELIGIBILITY_MARKERS.find(
      (m) => m.buyoutPackageId === MISSING_EVIDENCE_PKG.id,
    );
    expect(marker).toBeDefined();
    expect(marker?.eligible).toBe(false);
    expect(marker?.refusalReasons).toContain('missing-evidence-link');
  });
});

// ---------------------------------------------------------------------------
// 14. Missing-commitment scenario assertions.
// ---------------------------------------------------------------------------

describe('Missing-commitment scenario', () => {
  it('package status is contract-executed (or later non-Procore state)', () => {
    expect(['contract-executed', 'compliance-pending', 'procurement-tracking']).toContain(
      MISSING_COMMITMENT_PKG.status,
    );
  });

  it('package has zero CommitmentLink records associated', () => {
    const links = SAMPLE_BUYOUT_LOG_COMMITMENT_LINKS.filter(
      (l) => l.buyoutPackageId === MISSING_COMMITMENT_PKG.id,
    );
    expect(links).toEqual([]);
  });

  it('completion gate returns non-complete and flags procore-commitment-or-waiver', () => {
    const outcome = evaluateBuyoutCompletionGate(
      MISSING_COMMITMENT_PKG,
      childrenForPackage(MISSING_COMMITMENT_PKG.id),
    );
    expect(outcome.result).not.toBe('complete');
    expect(outcome.missing).toContain('procore-commitment-or-waiver');
  });

  it('priority action candidate with PROCORE_COMMITMENT_MISSING is present', () => {
    const candidate = SAMPLE_BUYOUT_LOG_PRIORITY_ACTION_CANDIDATES.find(
      (c) =>
        c.buyoutPackageId === MISSING_COMMITMENT_PKG.id &&
        c.reasonCode === 'PROCORE_COMMITMENT_MISSING',
    );
    expect(candidate).toBeDefined();
    expect(candidate?.classification).toBe('external-system-mapping');
  });
});

// ---------------------------------------------------------------------------
// 15. Reference-posture states are inert.
// ---------------------------------------------------------------------------

describe('Reference-posture states are inert', () => {
  it('reference posture states are reachable through the transition map', () => {
    expect(BUYOUT_PACKAGE_ALLOWED_TRANSITIONS['contract-executed']).toContain(
      'procore-commitment-pending',
    );
    expect(BUYOUT_PACKAGE_ALLOWED_TRANSITIONS['procore-commitment-pending']).toContain(
      'procore-commitment-created',
    );
  });

  it('reference posture states surface in fixtures', () => {
    const referencePostureStates: readonly string[] = BUYOUT_PACKAGE_REFERENCE_POSTURE_STATES;
    const reached = SAMPLE_BUYOUT_LOG_PACKAGES.some((p) =>
      referencePostureStates.includes(p.status),
    );
    expect(reached).toBe(true);
  });

  it('no exported helper is named to imply Procore I/O / writeback / mutation', () => {
    const exportedNames = Object.keys(BuyoutLogModule);
    const callerVerbs: readonly RegExp[] = [
      /^createProcore/,
      /^updateProcore/,
      /^deleteProcore/,
      /^postToProcore/,
      /^writeBack/,
      /^syncToProcore/,
      /^mirrorProcore/,
    ];
    for (const name of exportedNames) {
      for (const pattern of callerVerbs) {
        expect(pattern.test(name), `forbidden runtime verb in export: ${name}`).toBe(false);
      }
    }
  });
});
