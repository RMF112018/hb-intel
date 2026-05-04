/**
 * PCC Shared Procore Data Layer Contracts — tests.
 *
 * Phase 3 / Wave 13 / Prompt 13C. Pure-contract tests. Asserts:
 *   - vocabulary integrity;
 *   - subject-area coverage (all 18 areas, classifications, postures);
 *   - writebackAllowed === false / writePosture in {blocked, not-authorized} for every area;
 *   - field-mutability map exhaustiveness (object link, curated summary, derived signal, sync-health entry);
 *   - source-lineage required for object links, curated summaries, derived signals, and HBI-grounding citations;
 *   - derived signal category/family coverage (all 11 categories);
 *   - freshness wrapper parity with the Wave 13B helper;
 *   - isProcoreSignalActionable truth table;
 *   - buildProcoreObjectLinkDedupeKey determinism + collision behavior;
 *   - mapProcoreSourceStatusToPccPreviewState exhaustive coverage over PCC_PROCORE_SOURCE_STATES;
 *   - redactProcoreSyncErrorMessage proofs for URLs, UPNs, bearer/api-key/access-token/refresh-token/secret/password;
 *   - fixture cross-reference (ids resolve, dedupe keys match);
 *   - source-scan posture: no live URLs, no real UPN domains, no secret-like placeholders, no
 *     Date.now / Math.random / crypto.randomUUID / randomUUID, no live fetch / SDK / runtime
 *     imports, no anchored mutation-verb helper names.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES,
  PCC_PROCORE_DERIVED_SIGNAL_FIELD_MUTABILITY,
  PCC_PROCORE_DERIVED_SIGNAL_KINDS,
  PCC_PROCORE_DERIVED_SIGNAL_KIND_TO_CATEGORY,
  PCC_PROCORE_DERIVED_SIGNAL_SEVERITIES,
  PCC_PROCORE_FIELD_MUTABILITY_CLASSES,
  PCC_PROCORE_FRESHNESS_BANDS,
  PCC_PROCORE_OBJECT_LINK_FIELD_MUTABILITY,
  PCC_PROCORE_CURATED_SUMMARY_FIELD_MUTABILITY,
  PCC_PROCORE_SOURCE_REFRESH_TRIGGERS,
  PCC_PROCORE_SOURCE_STATES,
  PCC_PROCORE_SUBJECT_AREA_CLASSIFICATIONS,
  PCC_PROCORE_SUBJECT_AREA_IDS,
  PCC_PROCORE_SUBJECT_AREA_READ_POSTURES,
  PCC_PROCORE_SUBJECT_AREA_REGISTRY,
  PCC_PROCORE_SUBJECT_AREA_WRITE_POSTURES,
  PCC_PROCORE_SYNC_HEALTH_ENTRY_FIELD_MUTABILITY,
  PCC_PROCORE_SYNC_STATES,
  buildProcoreObjectLinkDedupeKey,
  deriveProcoreFreshnessBand,
  isProcoreSignalActionable,
  mapProcoreSourceStatusToPccPreviewState,
  redactProcoreSyncErrorMessage,
  type PccProcoreDerivedSignal,
  type PccProcoreSourceState,
} from './PccProcoreDataLayer.js';
import { derivePccProcoreMappingFreshnessBand } from './PccProcoreProjectMapping.js';
import {
  SAMPLE_PROCORE_CURATED_SUMMARIES,
  SAMPLE_PROCORE_DERIVED_SIGNALS,
  SAMPLE_PROCORE_OBJECT_LINKS,
  SAMPLE_PROCORE_SOURCE_LINEAGES,
  SAMPLE_PROCORE_SUBJECT_AREAS,
  SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
} from './fixtures/procoreDataLayer.js';

// ---------------------------------------------------------------------------
// Vocabulary integrity.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — vocabulary integrity', () => {
  it('every tuple is non-empty and unique', () => {
    for (const tuple of [
      PCC_PROCORE_SUBJECT_AREA_IDS,
      PCC_PROCORE_SUBJECT_AREA_READ_POSTURES,
      PCC_PROCORE_SUBJECT_AREA_WRITE_POSTURES,
      PCC_PROCORE_SUBJECT_AREA_CLASSIFICATIONS,
      PCC_PROCORE_SOURCE_STATES,
      PCC_PROCORE_SYNC_STATES,
      PCC_PROCORE_FRESHNESS_BANDS,
      PCC_PROCORE_SOURCE_REFRESH_TRIGGERS,
      PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES,
      PCC_PROCORE_DERIVED_SIGNAL_KINDS,
      PCC_PROCORE_DERIVED_SIGNAL_SEVERITIES,
      PCC_PROCORE_FIELD_MUTABILITY_CLASSES,
    ]) {
      expect(tuple.length).toBeGreaterThan(0);
      expect(new Set(tuple).size).toBe(tuple.length);
    }
  });

  it('every signal kind is mapped to a known signal category', () => {
    for (const kind of PCC_PROCORE_DERIVED_SIGNAL_KINDS) {
      const category = PCC_PROCORE_DERIVED_SIGNAL_KIND_TO_CATEGORY[kind];
      expect(PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES).toContain(category);
    }
  });

  it('source-state vocabulary covers required degraded modes plus available', () => {
    expect(PCC_PROCORE_SOURCE_STATES).toEqual(
      expect.arrayContaining([
        'available',
        'mapping-missing',
        'permission-denied',
        'tool-disabled',
        'stale',
        'rate-limited',
        'endpoint-deprecated',
        'object-inaccessible',
        'backend-unavailable',
        'source-unavailable',
      ]),
    );
  });
});

// ---------------------------------------------------------------------------
// Subject-area coverage.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — subject-area coverage', () => {
  it('registry covers all 18 required subject areas', () => {
    const required = [
      'projects',
      'companies',
      'directories',
      'rfis',
      'submittals',
      'observations',
      'punch',
      'daily-logs',
      'drawings',
      'specifications',
      'photos',
      'inspections',
      'documents',
      'commitments',
      'change-events',
      'change-orders',
      'vendors',
      'budget',
    ];
    expect([...PCC_PROCORE_SUBJECT_AREA_IDS]).toEqual(expect.arrayContaining(required));
    expect(Object.keys(PCC_PROCORE_SUBJECT_AREA_REGISTRY)).toEqual(
      expect.arrayContaining(required),
    );
  });

  it('every registry entry has writebackAllowed === false and a blocked write posture', () => {
    for (const id of PCC_PROCORE_SUBJECT_AREA_IDS) {
      const entry = PCC_PROCORE_SUBJECT_AREA_REGISTRY[id];
      expect(entry.writebackAllowed).toBe(false);
      expect(['blocked', 'not-authorized']).toContain(entry.writePosture);
      expect(PCC_PROCORE_SUBJECT_AREA_READ_POSTURES).toContain(entry.readPosture);
      expect(PCC_PROCORE_SUBJECT_AREA_CLASSIFICATIONS).toContain(entry.classification);
    }
  });

  it('financial-reference subject areas (commitments, change-events, change-orders, budget) are reference-only and not accounting truth', () => {
    const financialIds = ['commitments', 'change-events', 'change-orders', 'budget'] as const;
    for (const id of financialIds) {
      const entry = PCC_PROCORE_SUBJECT_AREA_REGISTRY[id];
      expect(entry.classification).toBe('financial-reference');
      expect(entry.writebackAllowed).toBe(false);
      expect(['blocked', 'not-authorized']).toContain(entry.writePosture);
    }
  });

  it('fixture subject-area sample covers all 18 registry entries', () => {
    expect(SAMPLE_PROCORE_SUBJECT_AREAS.length).toBe(PCC_PROCORE_SUBJECT_AREA_IDS.length);
    const observed = new Set(SAMPLE_PROCORE_SUBJECT_AREAS.map((s) => s.id));
    for (const id of PCC_PROCORE_SUBJECT_AREA_IDS) {
      expect(observed.has(id)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Field mutability exhaustiveness.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — field-mutability exhaustiveness', () => {
  function classified(map: Record<string, unknown>): Set<string> {
    return new Set(Object.keys(map));
  }

  it('every fixture object link has every field classified in the mutability map', () => {
    const classifiedFields = classified(PCC_PROCORE_OBJECT_LINK_FIELD_MUTABILITY);
    for (const link of SAMPLE_PROCORE_OBJECT_LINKS) {
      for (const key of Object.keys(link)) {
        expect(classifiedFields.has(key)).toBe(true);
      }
    }
  });

  it('every fixture curated summary has every field classified in the mutability map', () => {
    const classifiedFields = classified(PCC_PROCORE_CURATED_SUMMARY_FIELD_MUTABILITY);
    for (const summary of SAMPLE_PROCORE_CURATED_SUMMARIES) {
      for (const key of Object.keys(summary)) {
        expect(classifiedFields.has(key)).toBe(true);
      }
    }
  });

  it('every fixture derived signal has every field classified in the mutability map', () => {
    const classifiedFields = classified(PCC_PROCORE_DERIVED_SIGNAL_FIELD_MUTABILITY);
    for (const signal of SAMPLE_PROCORE_DERIVED_SIGNALS) {
      for (const key of Object.keys(signal)) {
        expect(classifiedFields.has(key)).toBe(true);
      }
    }
  });

  it('every fixture sync-health entry has every field classified in the mutability map', () => {
    const classifiedFields = classified(PCC_PROCORE_SYNC_HEALTH_ENTRY_FIELD_MUTABILITY);
    for (const entry of SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES) {
      for (const key of Object.keys(entry)) {
        expect(classifiedFields.has(key)).toBe(true);
      }
    }
  });

  it('every classification value in every map is a declared mutability class', () => {
    const allowed = new Set<string>(PCC_PROCORE_FIELD_MUTABILITY_CLASSES);
    const allMaps = [
      PCC_PROCORE_OBJECT_LINK_FIELD_MUTABILITY,
      PCC_PROCORE_CURATED_SUMMARY_FIELD_MUTABILITY,
      PCC_PROCORE_DERIVED_SIGNAL_FIELD_MUTABILITY,
      PCC_PROCORE_SYNC_HEALTH_ENTRY_FIELD_MUTABILITY,
    ];
    for (const map of allMaps) {
      for (const cls of Object.values(map)) {
        expect(allowed.has(cls)).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Source-lineage required for object links, curated summaries, derived
// signals, and HBI-grounding citations.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — source-lineage required surfaces', () => {
  it('every object link carries a non-empty source lineage', () => {
    expect(SAMPLE_PROCORE_OBJECT_LINKS.length).toBeGreaterThan(0);
    for (const link of SAMPLE_PROCORE_OBJECT_LINKS) {
      expect(link.sourceLineage).toBeDefined();
      expect(link.sourceLineage.procoreCompanyId.length).toBeGreaterThan(0);
      expect(link.sourceLineage.procoreObjectId.length).toBeGreaterThan(0);
      expect(link.sourceLineage.procoreObjectType.length).toBeGreaterThan(0);
      expect(link.sourceLineage.capturedAtUtc.length).toBeGreaterThan(0);
    }
  });

  it('every curated summary carries a non-empty source lineage', () => {
    expect(SAMPLE_PROCORE_CURATED_SUMMARIES.length).toBeGreaterThan(0);
    for (const summary of SAMPLE_PROCORE_CURATED_SUMMARIES) {
      expect(summary.sourceLineage).toBeDefined();
      expect(summary.sourceLineage.procoreCompanyId.length).toBeGreaterThan(0);
      expect(summary.sourceLineage.procoreObjectId.length).toBeGreaterThan(0);
    }
  });

  it('every derived signal carries a non-empty source lineage', () => {
    expect(SAMPLE_PROCORE_DERIVED_SIGNALS.length).toBeGreaterThan(0);
    for (const signal of SAMPLE_PROCORE_DERIVED_SIGNALS) {
      expect(signal.sourceLineage).toBeDefined();
      expect(signal.sourceLineage.procoreCompanyId.length).toBeGreaterThan(0);
      expect(signal.sourceLineage.procoreObjectId.length).toBeGreaterThan(0);
    }
  });

  it('every HBI-grounding-citation derived signal carries a non-empty source lineage and citation id', () => {
    const citations = SAMPLE_PROCORE_DERIVED_SIGNALS.filter(
      (s) => s.category === 'hbi-grounding-citation',
    );
    expect(citations.length).toBeGreaterThan(0);
    for (const citation of citations) {
      expect(citation.sourceLineage).toBeDefined();
      expect(citation.sourceLineage.procoreCompanyId.length).toBeGreaterThan(0);
      expect(citation.sourceLineage.procoreObjectId.length).toBeGreaterThan(0);
      expect(citation.hbiGroundingCitationId).toBeDefined();
      expect((citation.hbiGroundingCitationId ?? '').length).toBeGreaterThan(0);
    }
  });

  it('source lineages reference declared subject areas and refresh triggers only', () => {
    for (const lineage of SAMPLE_PROCORE_SOURCE_LINEAGES) {
      expect(PCC_PROCORE_SUBJECT_AREA_IDS).toContain(lineage.subjectArea);
      expect(PCC_PROCORE_SOURCE_REFRESH_TRIGGERS).toContain(lineage.refreshTrigger);
    }
  });
});

// ---------------------------------------------------------------------------
// Derived signal category/family coverage.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — derived signal category coverage', () => {
  it('all 11 cross-module categories are declared', () => {
    const required = [
      'priority-action',
      'readiness-impact',
      'risk-exposure-signal',
      'workflow-ball-in-court',
      'evidence-link',
      'document-currency-signal',
      'financial-exposure-signal',
      'quality-safety-exception',
      'field-execution-gap',
      'subcontractor-performance-signal',
      'hbi-grounding-citation',
    ];
    expect([...PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES]).toEqual(expect.arrayContaining(required));
  });

  it('every category is exercised by at least one fixture derived signal', () => {
    const observed = new Set(SAMPLE_PROCORE_DERIVED_SIGNALS.map((s) => s.category));
    for (const category of PCC_PROCORE_DERIVED_SIGNAL_CATEGORIES) {
      expect(observed.has(category)).toBe(true);
    }
  });

  it('every fixture signal category matches the kind→category map', () => {
    for (const signal of SAMPLE_PROCORE_DERIVED_SIGNALS) {
      const expectedCategory = PCC_PROCORE_DERIVED_SIGNAL_KIND_TO_CATEGORY[signal.signalKind];
      expect(signal.category).toBe(expectedCategory);
    }
  });
});

// ---------------------------------------------------------------------------
// Freshness wrapper parity with 13B helper.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — deriveProcoreFreshnessBand parity with 13B', () => {
  const NOW = new Date('2026-05-04T12:00:00Z');
  const inputs: ReadonlyArray<string | undefined> = [
    undefined,
    '',
    '   ',
    'not-a-real-date',
    '2026-06-01T00:00:00Z',
    '2026-05-01T12:00:00Z',
    '2026-04-04T12:00:00Z',
    '2026-03-10T12:00:00Z',
    '2026-01-01T12:00:00Z',
    '2025-09-12T09:00:00Z',
  ];

  for (const input of inputs) {
    it(`returns the same band as the 13B helper for input ${JSON.stringify(input)}`, () => {
      expect(deriveProcoreFreshnessBand(NOW, input)).toBe(
        derivePccProcoreMappingFreshnessBand(NOW, input),
      );
    });
  }

  it('respects caller-supplied bounds the same way as the 13B helper', () => {
    const tightBounds = { freshUpToDays: 1, recentUpToDays: 2, staleUpToDays: 3 };
    const sample = '2026-04-29T12:00:00Z';
    expect(deriveProcoreFreshnessBand(NOW, sample, tightBounds)).toBe(
      derivePccProcoreMappingFreshnessBand(NOW, sample, tightBounds),
    );
  });
});

// ---------------------------------------------------------------------------
// isProcoreSignalActionable truth table.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — isProcoreSignalActionable', () => {
  function makeSignal(overrides: Partial<PccProcoreDerivedSignal> = {}): PccProcoreDerivedSignal {
    return {
      id: 'signal-test',
      subjectArea: 'rfis',
      signalKind: 'open-rfi-overdue',
      category: 'priority-action',
      severity: 'attention',
      summary: 'test summary',
      sourceLineage: {
        subjectArea: 'rfis',
        procoreCompanyId: 'pc-test',
        procoreObjectId: 'po-test',
        procoreObjectType: 'RFI',
        capturedAtUtc: '2026-05-04T12:00:00Z',
        refreshTrigger: 'scheduled',
      },
      evaluatedAtUtc: '2026-05-04T12:00:00Z',
      ...overrides,
    };
  }

  it('returns false for severity info', () => {
    expect(isProcoreSignalActionable(makeSignal({ severity: 'info' }))).toBe(false);
  });

  it('returns true for severity attention with valid lineage', () => {
    expect(isProcoreSignalActionable(makeSignal({ severity: 'attention' }))).toBe(true);
  });

  it('returns true for severity critical with valid lineage', () => {
    expect(isProcoreSignalActionable(makeSignal({ severity: 'critical' }))).toBe(true);
  });

  it('returns false when source lineage procoreCompanyId is empty', () => {
    expect(
      isProcoreSignalActionable(
        makeSignal({
          sourceLineage: {
            subjectArea: 'rfis',
            procoreCompanyId: '',
            procoreObjectId: 'po-test',
            procoreObjectType: 'RFI',
            capturedAtUtc: '2026-05-04T12:00:00Z',
            refreshTrigger: 'scheduled',
          },
        }),
      ),
    ).toBe(false);
  });

  it('returns false when source lineage procoreObjectId is empty', () => {
    expect(
      isProcoreSignalActionable(
        makeSignal({
          sourceLineage: {
            subjectArea: 'rfis',
            procoreCompanyId: 'pc-test',
            procoreObjectId: '',
            procoreObjectType: 'RFI',
            capturedAtUtc: '2026-05-04T12:00:00Z',
            refreshTrigger: 'scheduled',
          },
        }),
      ),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildProcoreObjectLinkDedupeKey determinism / collision behavior.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — buildProcoreObjectLinkDedupeKey', () => {
  it('is deterministic: same inputs produce the same key', () => {
    const a = buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1');
    const b = buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1');
    expect(a).toBe(b);
  });

  it('different subject areas produce different keys', () => {
    expect(buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1')).not.toBe(
      buildProcoreObjectLinkDedupeKey('submittals', 'pc-1', 'po-1'),
    );
  });

  it('different procoreCompanyIds produce different keys', () => {
    expect(buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1')).not.toBe(
      buildProcoreObjectLinkDedupeKey('rfis', 'pc-2', 'po-1'),
    );
  });

  it('different procoreObjectIds produce different keys', () => {
    expect(buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1')).not.toBe(
      buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-2'),
    );
  });

  it('present vs absent procoreObjectKey never collide', () => {
    expect(buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1')).not.toBe(
      buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1', 'extra-key'),
    );
  });

  it('different procoreObjectKeys produce different keys', () => {
    expect(buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1', 'k1')).not.toBe(
      buildProcoreObjectLinkDedupeKey('rfis', 'pc-1', 'po-1', 'k2'),
    );
  });

  it('every fixture object link dedupeKey matches the helper output', () => {
    for (const link of SAMPLE_PROCORE_OBJECT_LINKS) {
      expect(link.dedupeKey).toBe(
        buildProcoreObjectLinkDedupeKey(
          link.subjectArea,
          link.procoreCompanyId,
          link.procoreObjectId,
          link.procoreObjectKey,
        ),
      );
    }
  });
});

// ---------------------------------------------------------------------------
// mapProcoreSourceStatusToPccPreviewState exhaustive coverage.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — mapProcoreSourceStatusToPccPreviewState', () => {
  const validPccStatuses = new Set([
    'available',
    'backend-unavailable',
    'source-unavailable',
    'missing-config',
    'stale',
    'unauthorized',
    'forbidden',
  ]);

  for (const procoreState of PCC_PROCORE_SOURCE_STATES) {
    it(`maps ${procoreState} to a valid PCC read-model source status`, () => {
      const mapped = mapProcoreSourceStatusToPccPreviewState(procoreState as PccProcoreSourceState);
      expect(validPccStatuses.has(mapped)).toBe(true);
    });
  }

  it('maps degraded modes to recognizable PCC statuses', () => {
    expect(mapProcoreSourceStatusToPccPreviewState('available')).toBe('available');
    expect(mapProcoreSourceStatusToPccPreviewState('mapping-missing')).toBe('missing-config');
    expect(mapProcoreSourceStatusToPccPreviewState('permission-denied')).toBe('forbidden');
    expect(mapProcoreSourceStatusToPccPreviewState('stale')).toBe('stale');
    expect(mapProcoreSourceStatusToPccPreviewState('backend-unavailable')).toBe(
      'backend-unavailable',
    );
    expect(mapProcoreSourceStatusToPccPreviewState('object-inaccessible')).toBe('forbidden');
  });
});

// ---------------------------------------------------------------------------
// redactProcoreSyncErrorMessage proofs.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — redactProcoreSyncErrorMessage', () => {
  it('returns empty string for empty input', () => {
    expect(redactProcoreSyncErrorMessage('')).toBe('');
  });

  it('redacts http and https URLs', () => {
    const out = redactProcoreSyncErrorMessage(
      'Provider timeout calling https://example.invalid/api/v1/rfis and http://example.invalid/x',
    );
    expect(out).not.toMatch(/https?:\/\//);
    expect(out).toContain('[redacted-url]');
  });

  it('redacts UPN-like fragments', () => {
    const out = redactProcoreSyncErrorMessage(
      'Provider rejected request from someone@example.com with permission denied.',
    );
    expect(out).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    expect(out).toContain('[redacted-upn]');
  });

  it('redacts bearer-token fragments', () => {
    const out = redactProcoreSyncErrorMessage('Authorization: Bearer abcdef.123-token+value/=');
    expect(out).not.toMatch(/Bearer\s+[A-Za-z0-9._\-+/=]+/);
    expect(out).toContain('Bearer [redacted-token]');
  });

  it('redacts api-key, access-token, refresh-token, secret, and password key=value fragments', () => {
    const out = redactProcoreSyncErrorMessage(
      'Provider error: api_key=sample-value, access_token=tok-1, refresh_token=tok-2, secret=hush, password=hunter2',
    );
    expect(out).toContain('api_key=[redacted-secret]');
    expect(out).toContain('access_token=[redacted-secret]');
    expect(out).toContain('refresh_token=[redacted-secret]');
    expect(out).toContain('secret=[redacted-secret]');
    expect(out).toContain('password=[redacted-secret]');
    expect(out).not.toMatch(/sample-value/);
    expect(out).not.toMatch(/tok-1/);
    expect(out).not.toMatch(/hush/);
    expect(out).not.toMatch(/hunter2/);
  });

  it('passes through benign messages unchanged', () => {
    const benign =
      'Provider returned partial result; retry scheduled. No further detail available.';
    expect(redactProcoreSyncErrorMessage(benign)).toBe(benign);
  });
});

// ---------------------------------------------------------------------------
// Fixture cross-reference.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — fixture cross-reference', () => {
  it('curated summaries reference real object link ids', () => {
    const linkIds = new Set(SAMPLE_PROCORE_OBJECT_LINKS.map((l) => l.id));
    for (const summary of SAMPLE_PROCORE_CURATED_SUMMARIES) {
      expect(linkIds.has(summary.objectLinkId)).toBe(true);
    }
  });

  it('derived signals that reference an object link id resolve to a real link', () => {
    const linkIds = new Set(SAMPLE_PROCORE_OBJECT_LINKS.map((l) => l.id));
    for (const signal of SAMPLE_PROCORE_DERIVED_SIGNALS) {
      if (signal.objectLinkId !== undefined) {
        expect(linkIds.has(signal.objectLinkId)).toBe(true);
      }
    }
  });

  it('sync-health entry subject areas all exist in the registry', () => {
    for (const entry of SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES) {
      expect(PCC_PROCORE_SUBJECT_AREA_IDS).toContain(entry.subjectArea);
      expect(PCC_PROCORE_SYNC_STATES).toContain(entry.syncState);
      expect(PCC_PROCORE_SOURCE_STATES).toContain(entry.sourceState);
      expect(PCC_PROCORE_FRESHNESS_BANDS).toContain(entry.freshnessBand);
    }
  });

  it('read-model envelope payload references the same fixture sets', () => {
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.subjectAreas).toBe(SAMPLE_PROCORE_SUBJECT_AREAS);
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.syncHealthEntries).toBe(
      SAMPLE_PROCORE_SYNC_HEALTH_ENTRIES,
    );
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.sourceLineages).toBe(
      SAMPLE_PROCORE_SOURCE_LINEAGES,
    );
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.objectLinks).toBe(SAMPLE_PROCORE_OBJECT_LINKS);
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.curatedSummaries).toBe(
      SAMPLE_PROCORE_CURATED_SUMMARIES,
    );
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.derivedSignals).toBe(
      SAMPLE_PROCORE_DERIVED_SIGNALS,
    );
    expect(SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL.ownershipNote).toContain('No write-back');
  });
});

// ---------------------------------------------------------------------------
// Source-scan posture.
// ---------------------------------------------------------------------------

describe('PccProcoreDataLayer — source-scan posture', () => {
  const CONTRACT_PATH = fileURLToPath(new URL('./PccProcoreDataLayer.ts', import.meta.url));
  const FIXTURE_PATH = fileURLToPath(new URL('./fixtures/procoreDataLayer.ts', import.meta.url));

  function strip(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  }

  function stripAll(source: string): string {
    return strip(source)
      .replace(/'[^'\\]*(?:\\.[^'\\]*)*'/g, ' ')
      .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, ' ')
      .replace(/`[^`\\]*(?:\\.[^`\\]*)*`/g, ' ');
  }

  it('contract source has no runtime / SDK imports', () => {
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
    const verbAnchoredFunction =
      /^\s*export\s+function\s+(write|sync|execute|apply|repair|upload|delete|mutate|fetch)[A-Z]/m;
    expect(source).not.toMatch(verbAnchoredFunction);
  });

  it('contract source has no non-deterministic identifier sources (comments stripped)', () => {
    const stripped = strip(readFileSync(CONTRACT_PATH, 'utf8'));
    const forbidden = [
      /\bDate\.now\s*\(/,
      /\bMath\.random\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\brandomUUID\s*\(/,
      /\bfetch\s*\(/,
    ];
    for (const re of forbidden) {
      expect(stripped).not.toMatch(re);
    }
  });

  it('fixture source uses only the reserved invalid TLD for any URL', () => {
    const source = readFileSync(FIXTURE_PATH, 'utf8');
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

  it('fixture source has no non-deterministic identifier sources (comments stripped)', () => {
    const stripped = strip(readFileSync(FIXTURE_PATH, 'utf8'));
    const forbidden = [
      /\bDate\.now\s*\(/,
      /\bMath\.random\s*\(/,
      /\bcrypto\.randomUUID\s*\(/,
      /\brandomUUID\s*\(/,
      /\bfetch\s*\(/,
    ];
    for (const re of forbidden) {
      expect(stripped).not.toMatch(re);
    }
  });

  it('fixture source has no runtime / SDK imports', () => {
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

  it('contract source does not include vendor-SDK or write-back identifier vocabulary in code (comments stripped)', () => {
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
});
