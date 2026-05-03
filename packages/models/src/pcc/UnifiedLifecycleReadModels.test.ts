import { describe, expect, expectTypeOf, it } from 'vitest';
import type { PccReadModelEnvelope, PccReadModelResponseMap } from './PccReadModels.js';
import type {
  PccCrossProjectKnowledgeReadModel,
  PccProjectLensesReadModel,
  PccProjectMemoryReadModel,
  PccProjectTraceabilityReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
} from './UnifiedLifecycleReadModels.js';
import {
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE,
  SAMPLE_PROJECT_LENSES_ENVELOPE,
  SAMPLE_PROJECT_MEMORY_ENVELOPE,
  SAMPLE_PROJECT_TRACEABILITY_ENVELOPE,
  SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
  SAMPLE_UNIFIED_SEARCH_ENVELOPE,
  SAMPLE_WARRANTY_TRACE_ENVELOPE,
} from './fixtures/index.js';

const CANONICAL_UNIFIED_ROUTE_IDS = [
  'unified-lifecycle',
  'project-memory',
  'project-lenses',
  'project-traceability',
  'warranty-trace',
  'cross-project-knowledge',
  'unified-search',
] as const satisfies readonly (keyof PccReadModelResponseMap)[];

describe('Unified lifecycle read-model route typing', () => {
  it('locks canonical unified route IDs for future backend route mapping', () => {
    expect(CANONICAL_UNIFIED_ROUTE_IDS).toEqual([
      'unified-lifecycle',
      'project-memory',
      'project-lenses',
      'project-traceability',
      'warranty-trace',
      'cross-project-knowledge',
      'unified-search',
    ]);
  });

  it('maps canonical route IDs to intended envelope DTO types (compile-time)', () => {
    expectTypeOf<PccReadModelResponseMap['unified-lifecycle']>().toEqualTypeOf<
      PccReadModelEnvelope<PccUnifiedLifecycleReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['project-memory']>().toEqualTypeOf<
      PccReadModelEnvelope<PccProjectMemoryReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['project-lenses']>().toEqualTypeOf<
      PccReadModelEnvelope<PccProjectLensesReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['project-traceability']>().toEqualTypeOf<
      PccReadModelEnvelope<PccProjectTraceabilityReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['warranty-trace']>().toEqualTypeOf<
      PccReadModelEnvelope<PccWarrantyTraceReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['cross-project-knowledge']>().toEqualTypeOf<
      PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel>
    >();
    expectTypeOf<PccReadModelResponseMap['unified-search']>().toEqualTypeOf<
      PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>
    >();
  });
});

describe('Unified lifecycle read-model fixtures', () => {
  it('grounded unified-search responses contain lineage-bearing citations', () => {
    const grounded = SAMPLE_UNIFIED_SEARCH_ENVELOPE.data.responses.find((r) => r.grounded);
    expect(grounded).toBeDefined();
    if (!grounded || !grounded.grounded) return;
    expect(grounded.citations.length).toBeGreaterThan(0);
    expect(grounded.citations[0]?.sourceLineage.sourceRecordId.length).toBeGreaterThan(0);
  });

  it('refusal unified-search responses have zero citations and refusal reason', () => {
    const refusal = SAMPLE_UNIFIED_SEARCH_ENVELOPE.data.responses.find((r) => r.refused);
    expect(refusal).toBeDefined();
    if (!refusal || !refusal.refused) return;
    expect(refusal.citations).toHaveLength(0);
    expect(refusal.refusalReason.length).toBeGreaterThan(0);
  });

  it('cross-project references are permission-scoped', () => {
    const refs = SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE.data.crossProjectReferences;
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(ref.security.crossProjectAllowed).toBe(true);
    }
  });

  it('fixture responses do not claim PCC is the system of record', () => {
    const payloads = [
      SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
      SAMPLE_PROJECT_MEMORY_ENVELOPE,
      SAMPLE_PROJECT_LENSES_ENVELOPE,
      SAMPLE_PROJECT_TRACEABILITY_ENVELOPE,
      SAMPLE_WARRANTY_TRACE_ENVELOPE,
      SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE,
      SAMPLE_UNIFIED_SEARCH_ENVELOPE,
    ];

    for (const payload of payloads) {
      expect(JSON.stringify(payload).toLowerCase()).not.toContain('system of record');
    }
  });
});
