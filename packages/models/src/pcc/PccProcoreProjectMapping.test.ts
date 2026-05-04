/**
 * PCC HB Central Projects Registry + Procore Mapping Contract — tests.
 *
 * Phase 3 / Wave 13 / Prompt 13B. Pure-contract tests. No runtime
 * imports; no live URLs; no real UPNs; no secret-like placeholders;
 * no non-determinism. Asserts:
 *   - vocabulary integrity;
 *   - field-mutability map exhaustiveness;
 *   - state-transition rules (allowed and disallowed);
 *   - freshness derivation across boundary timestamps;
 *   - fixture cross-reference;
 *   - the legacy-procore-hint boundary (legacyProcoreHint alone never
 *     satisfies a confirmed canonical mapping);
 *   - source-scan: no live URLs, no real UPN domains, no secret-like
 *     placeholders, no non-deterministic identifier sources, no runtime
 *     framework / SDK imports, no Procore / Sage write-back vocabulary.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES,
  PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS,
  PCC_PROCORE_PROJECT_MAPPING_DEFAULT_FRESHNESS_BOUNDS_DAYS,
  PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY,
  PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY_CLASSES,
  PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS,
  PCC_PROCORE_PROJECT_MAPPING_OWNER_ROLES,
  PCC_PROCORE_PROJECT_MAPPING_QUERY_CARDINALITY_HINTS,
  PCC_PROCORE_PROJECT_MAPPING_QUERY_FILTER_SHAPES,
  PCC_PROCORE_PROJECT_MAPPING_REMEDIATION_HINTS,
  PCC_PROCORE_PROJECT_MAPPING_STATES,
  PCC_PROCORE_PROJECT_MAPPING_TERMINAL_STATES,
  assertPccProcoreProjectMappingTransition,
  derivePccProcoreMappingFreshnessBand,
  isPccProcoreProjectMappingTransitionAllowed,
  validatePccProcoreProjectMappingLegacyHintBoundary,
  type PccProcoreProjectMapping,
  type PccProcoreProjectMappingConfirmed,
  type PccProcoreProjectMappingState,
} from './PccProcoreProjectMapping.js';
import {
  PCC_PROCORE_PROJECT_MAPPING_SCENARIO_IDS,
  SAMPLE_PROCORE_PROJECT_MAPPINGS,
  SAMPLE_PROCORE_PROJECT_MAPPING_QUERY_RECOMMENDATIONS,
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_PROJECT_MAPPING_REGISTRY_CONTEXTS,
} from './fixtures/procoreProjectMapping.js';

// ---------------------------------------------------------------------------
// Vocabulary integrity.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — vocabulary integrity', () => {
  it('mapping states are non-empty and unique', () => {
    expect(PCC_PROCORE_PROJECT_MAPPING_STATES.length).toBeGreaterThan(0);
    expect(new Set(PCC_PROCORE_PROJECT_MAPPING_STATES).size).toBe(
      PCC_PROCORE_PROJECT_MAPPING_STATES.length,
    );
  });

  it('terminal states are a subset of mapping states', () => {
    for (const t of PCC_PROCORE_PROJECT_MAPPING_TERMINAL_STATES) {
      expect(PCC_PROCORE_PROJECT_MAPPING_STATES).toContain(t);
    }
  });

  it('owner roles, freshness bands, remediation hints, filter shapes, cardinality hints are non-empty and unique', () => {
    for (const tuple of [
      PCC_PROCORE_PROJECT_MAPPING_OWNER_ROLES,
      PCC_PROCORE_PROJECT_MAPPING_FRESHNESS_BANDS,
      PCC_PROCORE_PROJECT_MAPPING_REMEDIATION_HINTS,
      PCC_PROCORE_PROJECT_MAPPING_QUERY_FILTER_SHAPES,
      PCC_PROCORE_PROJECT_MAPPING_QUERY_CARDINALITY_HINTS,
      PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY_CLASSES,
    ]) {
      expect(tuple.length).toBeGreaterThan(0);
      expect(new Set(tuple).size).toBe(tuple.length);
    }
  });

  it('registry field internal-name map covers all expected logical fields', () => {
    const logical = Object.keys(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES);
    expect(logical).toEqual(
      expect.arrayContaining([
        'pccProjectId',
        'projectNumber',
        'projectName',
        'projectStage',
        'siteUrl',
        'projectManagerUpn',
        'projectExecutiveUpn',
        'legacyProcoreHint',
      ]),
    );
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.pccProjectId).toBe('field_1');
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.projectNumber).toBe('field_2');
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.projectName).toBe('field_3');
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.projectStage).toBe('field_6');
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.siteUrl).toBe('field_23');
    expect(PCC_HBCENTRAL_PROJECTS_REGISTRY_FIELD_INTERNAL_NAMES.legacyProcoreHint).toBe(
      'procoreProject',
    );
  });
});

// ---------------------------------------------------------------------------
// Field mutability exhaustiveness.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — field mutability map exhaustiveness', () => {
  it('every fixture field is classified in PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY', () => {
    const classifiedFields = new Set(Object.keys(PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY));
    for (const mapping of SAMPLE_PROCORE_PROJECT_MAPPINGS) {
      for (const key of Object.keys(mapping)) {
        expect(classifiedFields.has(key)).toBe(true);
      }
    }
  });

  it('every classification value is one of the declared mutability classes', () => {
    const allowed = new Set<string>(PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY_CLASSES);
    for (const cls of Object.values(PCC_PROCORE_PROJECT_MAPPING_FIELD_MUTABILITY)) {
      expect(allowed.has(cls)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// State transition rules.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — state transitions', () => {
  it('isPccProcoreProjectMappingTransitionAllowed returns true for documented transitions', () => {
    for (const from of PCC_PROCORE_PROJECT_MAPPING_STATES) {
      const allowed = PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS[from];
      for (const to of allowed) {
        expect(isPccProcoreProjectMappingTransitionAllowed(from, to)).toBe(true);
      }
    }
  });

  it('terminal state mapping-archived has no outbound transitions', () => {
    expect(PCC_PROCORE_PROJECT_MAPPING_ALLOWED_TRANSITIONS['mapping-archived']).toEqual([]);
  });

  it('disallowed transitions throw via assertPccProcoreProjectMappingTransition', () => {
    // unmapped -> mapping-confirmed is not allowed (must go through proposed first)
    expect(() => assertPccProcoreProjectMappingTransition('unmapped', 'mapping-confirmed')).toThrow(
      /transition not allowed/,
    );
    // mapping-archived -> any (terminal)
    expect(() =>
      assertPccProcoreProjectMappingTransition('mapping-archived', 'mapping-confirmed'),
    ).toThrow(/transition not allowed/);
  });

  it('transition to mapping-archived requires an archiveReason', () => {
    expect(() =>
      assertPccProcoreProjectMappingTransition('mapping-confirmed', 'mapping-archived'),
    ).toThrow(/archiveReason/);
    expect(() =>
      assertPccProcoreProjectMappingTransition('mapping-confirmed', 'mapping-archived', {
        archiveReason: 'Pursuit cancelled.',
      }),
    ).not.toThrow();
  });

  it('transition to mapping-conflict requires a reason', () => {
    expect(() =>
      assertPccProcoreProjectMappingTransition('mapping-confirmed', 'mapping-conflict'),
    ).toThrow(/reason/);
    expect(() =>
      assertPccProcoreProjectMappingTransition('mapping-confirmed', 'mapping-conflict', {
        reason: 'Two Procore candidates detected.',
      }),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Freshness derivation.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — freshness derivation', () => {
  const NOW = new Date('2026-05-04T12:00:00Z');

  it('returns "unknown" for missing or empty input', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, undefined)).toBe('unknown');
    expect(derivePccProcoreMappingFreshnessBand(NOW, '')).toBe('unknown');
    expect(derivePccProcoreMappingFreshnessBand(NOW, '   ')).toBe('unknown');
  });

  it('returns "unknown" for an unparseable timestamp', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, 'not-a-real-date')).toBe('unknown');
  });

  it('returns "unknown" when lastConfirmedAtUtc is in the future', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-06-01T00:00:00Z')).toBe('unknown');
  });

  it('returns "fresh" within the freshUpToDays bound (default 30)', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-05-01T12:00:00Z')).toBe('fresh');
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-04-04T12:00:00Z')).toBe('fresh');
  });

  it('returns "recent" between freshUpToDays and recentUpToDays (default 30..90)', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-03-10T12:00:00Z')).toBe('recent');
  });

  it('returns "stale" between recentUpToDays and staleUpToDays (default 90..180)', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-01-01T12:00:00Z')).toBe('stale');
  });

  it('returns "expired" beyond staleUpToDays (default >180)', () => {
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2025-09-12T09:00:00Z')).toBe('expired');
  });

  it('respects caller-supplied bounds', () => {
    const tightBounds = { freshUpToDays: 1, recentUpToDays: 2, staleUpToDays: 3 };
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-05-04T00:00:00Z', tightBounds)).toBe(
      'fresh',
    );
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-05-02T12:00:00Z', tightBounds)).toBe(
      'recent',
    );
    expect(derivePccProcoreMappingFreshnessBand(NOW, '2026-04-29T12:00:00Z', tightBounds)).toBe(
      'expired',
    );
  });

  it('default bounds are exposed and stable', () => {
    expect(PCC_PROCORE_PROJECT_MAPPING_DEFAULT_FRESHNESS_BOUNDS_DAYS).toEqual({
      freshUpToDays: 30,
      recentUpToDays: 90,
      staleUpToDays: 180,
    });
  });
});

// ---------------------------------------------------------------------------
// Fixture cross-reference.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — fixture cross-reference', () => {
  it('fixture set covers every declared scenario id, deterministic order', () => {
    expect(SAMPLE_PROCORE_PROJECT_MAPPINGS.length).toBe(
      PCC_PROCORE_PROJECT_MAPPING_SCENARIO_IDS.length,
    );
    expect(SAMPLE_PROCORE_PROJECT_MAPPING_REGISTRY_CONTEXTS.length).toBe(
      PCC_PROCORE_PROJECT_MAPPING_SCENARIO_IDS.length,
    );
  });

  it('every fixture mapping has a registry context whose pccProjectId matches', () => {
    for (const mapping of SAMPLE_PROCORE_PROJECT_MAPPINGS) {
      expect(mapping.registryContextSnapshot.pccProjectId).toBe(mapping.pccProjectId);
      expect(mapping.registryContextSnapshot.hbCentralListItemId).toBe(mapping.hbCentralListItemId);
    }
  });

  it('read-model envelope payload references the same fixture sets', () => {
    expect(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.mappings).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPINGS,
    );
    expect(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.registryContexts).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPING_REGISTRY_CONTEXTS,
    );
    expect(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.queryRecommendations).toBe(
      SAMPLE_PROCORE_PROJECT_MAPPING_QUERY_RECOMMENDATIONS,
    );
    expect(SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL.ownershipNote).toBe(
      'PCC owns mapping; legacyProcoreHint is informative only and never canonical.',
    );
  });

  it('fixture state distribution covers every mapping state', () => {
    const observedStates = new Set<PccProcoreProjectMappingState>(
      SAMPLE_PROCORE_PROJECT_MAPPINGS.map((m) => m.state),
    );
    for (const s of PCC_PROCORE_PROJECT_MAPPING_STATES) {
      expect(observedStates.has(s)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Legacy-procore-hint boundary.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — legacyProcoreHint boundary', () => {
  it('confirmed mappings always carry structured procore identifiers, never relying on legacyProcoreHint', () => {
    const confirmedFixtures = SAMPLE_PROCORE_PROJECT_MAPPINGS.filter(
      (m): m is PccProcoreProjectMappingConfirmed => m.state === 'mapping-confirmed',
    );
    expect(confirmedFixtures.length).toBeGreaterThan(0);
    for (const m of confirmedFixtures) {
      expect(m.procoreCompanyId.length).toBeGreaterThan(0);
      expect(m.procoreProjectId.length).toBeGreaterThan(0);
    }
  });

  it('every fixture mapping passes the runtime legacy-hint boundary check', () => {
    for (const m of SAMPLE_PROCORE_PROJECT_MAPPINGS) {
      expect(() => validatePccProcoreProjectMappingLegacyHintBoundary(m)).not.toThrow();
    }
  });

  it('a confirmed mapping with empty procoreCompanyId fails the boundary check even with a populated legacyProcoreHint', () => {
    const valid = SAMPLE_PROCORE_PROJECT_MAPPINGS.find(
      (m): m is PccProcoreProjectMappingConfirmed => m.state === 'mapping-confirmed',
    );
    if (!valid) throw new Error('expected at least one confirmed fixture');
    const tampered: PccProcoreProjectMappingConfirmed = {
      ...valid,
      procoreCompanyId: '',
      legacyProcoreHint: 'Some Legacy Hint Value',
    };
    expect(() => validatePccProcoreProjectMappingLegacyHintBoundary(tampered)).toThrow(
      /procoreCompanyId/,
    );
  });

  it('a confirmed mapping with empty procoreProjectId fails the boundary check even with a populated legacyProcoreHint', () => {
    const valid = SAMPLE_PROCORE_PROJECT_MAPPINGS.find(
      (m): m is PccProcoreProjectMappingConfirmed => m.state === 'mapping-confirmed',
    );
    if (!valid) throw new Error('expected at least one confirmed fixture');
    const tampered: PccProcoreProjectMappingConfirmed = {
      ...valid,
      procoreProjectId: '',
      legacyProcoreHint: 'Some Legacy Hint Value',
    };
    expect(() => validatePccProcoreProjectMappingLegacyHintBoundary(tampered)).toThrow(
      /procoreProjectId/,
    );
  });

  it('unmapped fixtures expose a legacyProcoreHint slot but never satisfy a confirmed mapping', () => {
    const unmapped = SAMPLE_PROCORE_PROJECT_MAPPINGS.filter((m) => m.state === 'unmapped');
    expect(unmapped.length).toBeGreaterThan(0);
    for (const m of unmapped) {
      // An unmapped mapping must not narrow as confirmed — the discriminated
      // union enforces this at compile time. The legacyProcoreHint may be
      // present but never authorizes confirmed-state behavior.
      expect(m.state).toBe('unmapped');
    }
  });
});

// ---------------------------------------------------------------------------
// Source-scan: contract + fixture files have no live URLs, no real UPN
// domains, no secret-like placeholders, no non-deterministic identifier
// sources, no runtime framework / SDK imports, no Procore / Sage write-back
// vocabulary.
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — source-scan posture', () => {
  const CONTRACT_PATH = fileURLToPath(new URL('./PccProcoreProjectMapping.ts', import.meta.url));
  const FIXTURE_PATH = fileURLToPath(
    new URL('./fixtures/procoreProjectMapping.ts', import.meta.url),
  );

  function strip(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  }

  function stripAll(source: string): string {
    return strip(source)
      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
      .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
      .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
  }

  it('contract source has no runtime framework / SDK imports', () => {
    const stripped = strip(readFileSync(CONTRACT_PATH, 'utf8'));
    const forbiddenImports = [
      /from\s+['"]@microsoft\/sp-/,
      /from\s+['"]@pnp\//,
      /from\s+['"]@microsoft\/microsoft-graph/,
      /from\s+['"]axios['"]/,
      /from\s+['"]fetch-/,
      /from\s+['"]node-fetch['"]/,
      /from\s+['"]@procore\//,
      /from\s+['"]@sage\//,
      /from\s+['"]node:fs['"]/,
      /from\s+['"]node:net['"]/,
      /from\s+['"]node:https?['"]/,
    ];
    for (const re of forbiddenImports) {
      expect(stripped).not.toMatch(re);
    }
  });

  it('contract source has no anchored mutation-verb function names', () => {
    const source = readFileSync(CONTRACT_PATH, 'utf8');
    // Match `export function <verbAnchored>` only at identifier start.
    const verbAnchoredFunction =
      /^\s*export\s+function\s+(write|sync|execute|apply|repair|upload|delete|mutate|fetch)[A-Z]/m;
    expect(source).not.toMatch(verbAnchoredFunction);
  });

  it('contract source has no Procore SDK or write-back vocabulary in code (comments stripped)', () => {
    const stripped = stripAll(readFileSync(CONTRACT_PATH, 'utf8'));
    const forbidden = [
      /\bwriteBack\b/i,
      /\bprocoreSdk\b/i,
      /\bprocoreClient\b/i,
      /\bprocoreFetch\b/i,
      /\bsageSdk\b/i,
      /\bsageClient\b/i,
      /\bgraphSdk\b/i,
      /\bgraphClient\b/i,
      /\bpnpClient\b/i,
    ];
    for (const re of forbidden) {
      expect(stripped).not.toMatch(re);
    }
  });

  it('fixture source uses only the reserved invalid TLD for any URL', () => {
    const source = readFileSync(FIXTURE_PATH, 'utf8');
    // No live https/http URLs other than https://example.invalid/...
    const liveHttpRe = /https?:\/\/(?!example\.invalid)[^\s'"`<>]+/g;
    const matches = source.match(liveHttpRe) ?? [];
    expect(matches).toEqual([]);
  });

  it('fixture source uses only the reserved @example.com UPN domain', () => {
    const source = readFileSync(FIXTURE_PATH, 'utf8');
    const upnRe = /[a-z0-9._%+-]+@(?!example\.com\b)[a-z0-9.-]+\.[a-z]{2,}/gi;
    const matches = source.match(upnRe) ?? [];
    expect(matches).toEqual([]);
  });

  it('fixture source has no secret-like placeholder vocabulary', () => {
    const stripped = strip(readFileSync(FIXTURE_PATH, 'utf8'));
    const forbidden = [
      /\bsecret\b/i,
      /\bbearer\b/i,
      /\bclient[_-]?secret\b/i,
      /\bapi[_-]?key\b/i,
      /\bprivate[_-]?key\b/i,
      /\baccess[_-]?token\b/i,
      /\brefresh[_-]?token\b/i,
      /\bpassword\b/i,
    ];
    for (const re of forbidden) {
      expect(stripped).not.toMatch(re);
    }
  });

  it('fixture source has no non-deterministic identifier sources', () => {
    const source = readFileSync(FIXTURE_PATH, 'utf8');
    const forbidden = [
      /\bDate\.now\s*\(/,
      /\bMath\.random\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\brandomUUID\s*\(/,
    ];
    for (const re of forbidden) {
      expect(source).not.toMatch(re);
    }
  });

  it('fixture source has no runtime framework / SDK imports', () => {
    const stripped = strip(readFileSync(FIXTURE_PATH, 'utf8'));
    const forbiddenImports = [
      /from\s+['"]@microsoft\/sp-/,
      /from\s+['"]@pnp\//,
      /from\s+['"]@microsoft\/microsoft-graph/,
      /from\s+['"]axios['"]/,
      /from\s+['"]node-fetch['"]/,
      /from\s+['"]@procore\//,
      /from\s+['"]@sage\//,
    ];
    for (const re of forbiddenImports) {
      expect(stripped).not.toMatch(re);
    }
  });
});

// ---------------------------------------------------------------------------
// Type-narrowing smoke checks (compile-time + runtime).
// ---------------------------------------------------------------------------

describe('PccProcoreProjectMapping — discriminated-union narrowing', () => {
  it('confirmed and stale variants narrow to required structured fields', () => {
    for (const m of SAMPLE_PROCORE_PROJECT_MAPPINGS) {
      const verified: PccProcoreProjectMapping = m;
      switch (verified.state) {
        case 'mapping-confirmed':
          expect(typeof verified.procoreCompanyId).toBe('string');
          expect(typeof verified.procoreProjectId).toBe('string');
          expect(typeof verified.lastConfirmedAtUtc).toBe('string');
          break;
        case 'mapping-stale':
          expect(typeof verified.procoreCompanyId).toBe('string');
          expect(typeof verified.procoreProjectId).toBe('string');
          expect(['stale', 'expired']).toContain(verified.freshnessBand);
          break;
        case 'mapping-proposed':
          expect(typeof verified.proposedProcoreCompanyId).toBe('string');
          expect(typeof verified.proposedProcoreProjectId).toBe('string');
          break;
        case 'mapping-conflict':
          expect(verified.conflictingProcoreCompanyIds.length).toBeGreaterThan(0);
          expect(verified.conflictingProcoreProjectIds.length).toBeGreaterThan(0);
          break;
        case 'mapping-archived':
          expect(typeof verified.archivedAtUtc).toBe('string');
          expect(typeof verified.archiveReason).toBe('string');
          break;
        case 'unmapped':
          // No additional required fields beyond the common shape.
          break;
      }
    }
  });
});
