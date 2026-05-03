/**
 * Unified Lifecycle adapter seam — adapter test suite.
 *
 * SHARED ADAPTER SEAM. NOT A ROUTED SURFACE.
 * Covers the eight adapters in
 * `apps/project-control-center/src/surfaces/unifiedLifecycle/` plus the
 * `summarizeLensVisibility` helper. Uses canonical
 * `@hbc/models/pcc` samples for `available` envelopes; builds local
 * synthetic envelopes inline for `masked` / `withheld` redaction tests
 * and for refusal-vs-grounded mapping. Does NOT modify model fixtures.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const TESTS_DIR = __dirname;
const SRC_ROOT = resolve(TESTS_DIR, '..');
import {
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL,
  SAMPLE_CROSS_PROJECT_REFERENCE,
  SAMPLE_FUTURE_PURSUIT_KNOWLEDGE_REFERENCE,
  SAMPLE_PROJECT_ASSUMPTION_RECORDS,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_PROJECT_LENSES_READ_MODEL,
  SAMPLE_PROJECT_LIFECYCLE_EVENTS,
  SAMPLE_PROJECT_MEMORY_READ_MODEL,
  SAMPLE_PROJECT_MEMORY_RECORD,
  SAMPLE_PROJECT_STAGE_LENS,
  SAMPLE_PROJECT_TRACEABILITY_EDGES,
  SAMPLE_PROJECT_TRACEABILITY_READ_MODEL,
  SAMPLE_RELATED_RECORD_CLUSTER,
  SAMPLE_TRACEABILITY_GRAPH_READ_MODEL,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
  SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD,
  SAMPLE_WARRANTY_TRACE_READ_MODEL,
  SAMPLE_WARRANTY_TRACE_RECORD,
} from '@hbc/models/pcc';
import type {
  PccCrossProjectKnowledgeReadModel,
  PccProjectId,
  PccProjectLensesReadModel,
  PccProjectLifecycleTimelineReadModel,
  PccProjectMemoryReadModel,
  PccProjectMemoryRecord,
  PccProjectTraceabilityReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccSecurityPosture,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
} from '@hbc/models/pcc';
import {
  buildPccCrossProjectKnowledgeViewModel,
  buildPccLifecycleTimelineViewModel,
  buildPccProjectLensesViewModel,
  buildPccProjectMemoryViewModel,
  buildPccProjectTraceabilityViewModel,
  buildPccUnifiedLifecycleViewModel,
  buildPccUnifiedSearchViewModel,
  buildPccWarrantyTraceViewModel,
  summarizeLensVisibility,
  type ILensVisibilityRecord,
} from '../surfaces/unifiedLifecycle/index.js';

const KNOWN_PROJECT_ID = 'p-ul-1001' as PccProjectId;
const GENERATED_AT = '2026-05-03T00:00:00.000Z';

function envelope<T>(
  data: T,
  sourceStatus: PccReadModelSourceStatus = 'available',
): PccReadModelEnvelope<T> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

const NONE_SECURITY: PccSecurityPosture = {
  classification: 'project-internal',
  allowedPersonas: ['project-manager'],
  redactionLevel: 'none',
  crossProjectAllowed: false,
};
const MASKED_SECURITY: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive'],
  redactionLevel: 'masked',
  crossProjectAllowed: false,
};
const WITHHELD_SECURITY: PccSecurityPosture = {
  classification: 'privileged',
  allowedPersonas: ['project-executive'],
  redactionLevel: 'withheld',
  crossProjectAllowed: false,
};

// ─────────────────────────────────────────────────────────────────────
// Lifecycle timeline
// ─────────────────────────────────────────────────────────────────────

describe('buildPccLifecycleTimelineViewModel', () => {
  const timeline: PccProjectLifecycleTimelineReadModel = {
    events: SAMPLE_PROJECT_LIFECYCLE_EVENTS,
    checkpoints: [],
    gateSignals: [],
    contextReferences: [],
  };

  it('normalizes available envelope and preserves sourceLineage + security + evidence per event', () => {
    const vm = buildPccLifecycleTimelineViewModel(envelope(timeline));
    expect(vm.sourceStatus).toBe('available');
    expect(vm.cardState).toBe('preview');
    expect(vm.events.length).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENTS.length);
    const eventVm = vm.events[0]!;
    const sourceEvent = SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]!;
    expect(eventVm.eventId).toBe(sourceEvent.eventId);
    expect(eventVm.sourceLineage).toBe(sourceEvent.sourceLineage);
    expect(eventVm.evidenceLinks).toBe(sourceEvent.evidenceLinks);
    expect(eventVm.redaction.classification).toBe(sourceEvent.security.classification);
    expect(eventVm.redaction.redactionLevel).toBe(sourceEvent.security.redactionLevel);
  });

  it('returns safe-empty for source-unavailable envelope without throwing', () => {
    const vm = buildPccLifecycleTimelineViewModel(envelope(timeline, 'source-unavailable'));
    expect(vm.sourceStatus).toBe('source-unavailable');
    expect(vm.cardState).toBe('unavailable-fixture');
    expect(vm.events).toEqual([]);
    expect(vm.checkpoints).toEqual([]);
    expect(vm.gateSignals).toEqual([]);
    expect(vm.contextReferences).toEqual([]);
  });

  it('returns safe-empty for backend-unavailable envelope', () => {
    const vm = buildPccLifecycleTimelineViewModel(envelope(timeline, 'backend-unavailable'));
    expect(vm.sourceStatus).toBe('backend-unavailable');
    expect(vm.cardState).toBe('error');
    expect(vm.events).toEqual([]);
  });

  it('exposes redacted=true and withheld=true flags on the redaction view (synthetic)', () => {
    const baseEvent = SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]!;
    const masked = { ...baseEvent, eventId: 'masked-evt', security: MASKED_SECURITY };
    const withheld = { ...baseEvent, eventId: 'withheld-evt', security: WITHHELD_SECURITY };
    const vm = buildPccLifecycleTimelineViewModel(
      envelope({ ...timeline, events: [baseEvent, masked, withheld] }),
    );
    expect(vm.events[1]!.redaction.redacted).toBe(true);
    expect(vm.events[1]!.redaction.withheld).toBe(false);
    expect(vm.events[1]!.redaction.redactionLevel).toBe('masked');
    expect(vm.events[2]!.redaction.withheld).toBe(true);
    expect(vm.events[2]!.redaction.redacted).toBe(false);
    expect(vm.events[2]!.redaction.redactionLevel).toBe('withheld');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Project memory
// ─────────────────────────────────────────────────────────────────────

describe('buildPccProjectMemoryViewModel', () => {
  it('normalizes available envelope and preserves decision/assumption discriminators', () => {
    const vm = buildPccProjectMemoryViewModel(envelope(SAMPLE_PROJECT_MEMORY_READ_MODEL));
    expect(vm.sourceStatus).toBe('available');
    expect(vm.records.length).toBe(SAMPLE_PROJECT_MEMORY_READ_MODEL.records.length);
    expect(vm.decisions.length).toBe(1);
    expect(vm.decisions[0]!.recordType).toBe('decision');
    expect(vm.decisions[0]!.decision).toBe(SAMPLE_PROJECT_DECISION_RECORD.decision);
    expect(vm.assumptions.length).toBe(SAMPLE_PROJECT_ASSUMPTION_RECORDS.length);
    expect(vm.assumptions[0]!.recordType).toBe('assumption');
    expect(vm.assumptions[0]!.assumption).toBe(SAMPLE_PROJECT_ASSUMPTION_RECORDS[0]!.assumption);
  });

  it('preserves sourceLineage + security + evidence on records', () => {
    const vm = buildPccProjectMemoryViewModel(envelope(SAMPLE_PROJECT_MEMORY_READ_MODEL));
    const noteVm = vm.records[0]!;
    expect(noteVm.memoryId).toBe(SAMPLE_PROJECT_MEMORY_RECORD.memoryId);
    expect(noteVm.sourceLineage).toBe(SAMPLE_PROJECT_MEMORY_RECORD.sourceLineage);
    expect(noteVm.evidenceLinks).toBe(SAMPLE_PROJECT_MEMORY_RECORD.evidenceLinks);
    expect(noteVm.redaction.classification).toBe(
      SAMPLE_PROJECT_MEMORY_RECORD.security.classification,
    );
  });

  it('returns safe-empty for source-unavailable / backend-unavailable', () => {
    const data: PccProjectMemoryReadModel = { records: [], decisions: [], assumptions: [] };
    const a = buildPccProjectMemoryViewModel(envelope(data, 'source-unavailable'));
    const b = buildPccProjectMemoryViewModel(envelope(data, 'backend-unavailable'));
    expect(a.records).toEqual([]);
    expect(a.decisions).toEqual([]);
    expect(a.assumptions).toEqual([]);
    expect(b.cardState).toBe('error');
  });

  it('exposes redacted/withheld flags on the redaction view (synthetic)', () => {
    const masked: PccProjectMemoryRecord = {
      ...SAMPLE_PROJECT_MEMORY_RECORD,
      memoryId: 'masked-mem',
      security: MASKED_SECURITY,
    };
    const withheld: PccProjectMemoryRecord = {
      ...SAMPLE_PROJECT_MEMORY_RECORD,
      memoryId: 'withheld-mem',
      security: WITHHELD_SECURITY,
    };
    const vm = buildPccProjectMemoryViewModel(
      envelope({ records: [masked, withheld], decisions: [], assumptions: [] }),
    );
    expect(vm.records[0]!.redaction.redacted).toBe(true);
    expect(vm.records[1]!.redaction.withheld).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Project lenses
// ─────────────────────────────────────────────────────────────────────

describe('buildPccProjectLensesViewModel + summarizeLensVisibility', () => {
  it('normalizes available envelope and exposes default lens', () => {
    const vm = buildPccProjectLensesViewModel(envelope(SAMPLE_PROJECT_LENSES_READ_MODEL));
    expect(vm.sourceStatus).toBe('available');
    expect(vm.lenses.length).toBeGreaterThan(0);
    expect(vm.defaultLensId).toBe(vm.lenses[0]!.lensId);
  });

  it('lens VM carries no route, workspace, navigation, or URL info', () => {
    const vm = buildPccProjectLensesViewModel(envelope(SAMPLE_PROJECT_LENSES_READ_MODEL));
    const serialized = JSON.stringify(vm);
    expect(serialized).not.toMatch(/route|workspace|href|navigateTo|surfaceId/i);
  });

  it('summarizeLensVisibility partitions records into visible/redacted/hidden by lens membership + redactionLevel', () => {
    const lens = SAMPLE_PROJECT_STAGE_LENS;
    const inLensMemId = lens.includedMemoryIds[0]!;
    const otherInLensMemId = lens.includedMemoryIds[1] ?? 'memory-extra';
    const records: ILensVisibilityRecord[] = [
      { id: inLensMemId, kind: 'memory', security: NONE_SECURITY },
      { id: otherInLensMemId, kind: 'memory', security: MASKED_SECURITY },
      { id: 'in-lens-withheld', kind: 'memory', security: WITHHELD_SECURITY },
      { id: 'not-in-lens', kind: 'memory', security: NONE_SECURITY },
    ];
    // Synthetic lens that explicitly includes our three test records but not 'not-in-lens'.
    const testLens = {
      ...lens,
      includedMemoryIds: [inLensMemId, otherInLensMemId, 'in-lens-withheld'],
    };
    const summary = summarizeLensVisibility(records, testLens);
    expect(summary.visibleCount).toBe(1);
    expect(summary.redactedCount).toBe(1);
    expect(summary.hiddenCount).toBe(2);
  });

  it('switching lens changes visibility counts but produces no route/workspace metadata', () => {
    const records: ILensVisibilityRecord[] = [
      { id: 'm-1', kind: 'memory', security: NONE_SECURITY },
      { id: 'm-2', kind: 'memory', security: MASKED_SECURITY },
      { id: 'm-3', kind: 'memory', security: NONE_SECURITY },
    ];
    const lensA = { ...SAMPLE_PROJECT_STAGE_LENS, includedMemoryIds: ['m-1', 'm-2'] };
    const lensB = { ...SAMPLE_PROJECT_STAGE_LENS, includedMemoryIds: ['m-3'] };
    const a = summarizeLensVisibility(records, lensA);
    const b = summarizeLensVisibility(records, lensB);
    expect(a).not.toEqual(b);
    expect(a.visibleCount + a.redactedCount + a.hiddenCount).toBe(records.length);
    expect(b.visibleCount + b.redactedCount + b.hiddenCount).toBe(records.length);
    // Output is plain counts — no nav.
    expect(Object.keys(a).sort()).toEqual(['hiddenCount', 'redactedCount', 'visibleCount']);
  });

  it('summarizeLensVisibility with undefined lens returns all-zero summary', () => {
    expect(summarizeLensVisibility([], undefined)).toEqual({
      visibleCount: 0,
      redactedCount: 0,
      hiddenCount: 0,
    });
  });

  it('returns safe-empty for source-unavailable', () => {
    const empty: PccProjectLensesReadModel = { stageLenses: [] };
    const vm = buildPccProjectLensesViewModel(envelope(empty, 'source-unavailable'));
    expect(vm.lenses).toEqual([]);
    expect(vm.defaultLensId).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Project traceability
// ─────────────────────────────────────────────────────────────────────

describe('buildPccProjectTraceabilityViewModel', () => {
  it('preserves edge confidence + sourceLineage on every edge', () => {
    const vm = buildPccProjectTraceabilityViewModel(envelope(SAMPLE_PROJECT_TRACEABILITY_READ_MODEL));
    expect(vm.edges.length).toBe(SAMPLE_PROJECT_TRACEABILITY_EDGES.length);
    for (let i = 0; i < vm.edges.length; i += 1) {
      const edgeVm = vm.edges[i]!;
      const source = SAMPLE_PROJECT_TRACEABILITY_EDGES[i]!;
      expect(edgeVm.confidence).toBe(source.confidence);
      expect(edgeVm.sourceLineage).toBe(source.sourceLineage);
    }
  });

  it('exposes graph edges + clusters as flat slots without wrapping in graph object', () => {
    const vm = buildPccProjectTraceabilityViewModel(envelope(SAMPLE_PROJECT_TRACEABILITY_READ_MODEL));
    expect(vm.graphEdges.length).toBe(SAMPLE_TRACEABILITY_GRAPH_READ_MODEL.edges.length);
    expect(vm.graphClusters.length).toBe(SAMPLE_TRACEABILITY_GRAPH_READ_MODEL.clusters.length);
    expect((vm as unknown as { graph?: unknown }).graph).toBeUndefined();
  });

  it('cluster VM preserves rootRecordId/type + relatedRecordIds + edgeIds', () => {
    const vm = buildPccProjectTraceabilityViewModel(envelope(SAMPLE_PROJECT_TRACEABILITY_READ_MODEL));
    const cluster = vm.clusters[0]!;
    expect(cluster.clusterId).toBe(SAMPLE_RELATED_RECORD_CLUSTER.clusterId);
    expect(cluster.rootRecordId).toBe(SAMPLE_RELATED_RECORD_CLUSTER.rootRecordId);
    expect(cluster.relatedRecordIds).toBe(SAMPLE_RELATED_RECORD_CLUSTER.relatedRecordIds);
  });

  it('returns safe-empty for source-unavailable', () => {
    const empty: PccProjectTraceabilityReadModel = {
      edges: [],
      clusters: [],
      graph: { edges: [], clusters: [] },
      relatedLifecycleEvents: [],
      relatedMemoryRecords: [],
    };
    const vm = buildPccProjectTraceabilityViewModel(envelope(empty, 'source-unavailable'));
    expect(vm.edges).toEqual([]);
    expect(vm.graphEdges).toEqual([]);
    expect(vm.relatedLifecycleEvents).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Warranty trace
// ─────────────────────────────────────────────────────────────────────

describe('buildPccWarrantyTraceViewModel', () => {
  it('preserves status verbatim including insufficient-evidence; no auto-resolution', () => {
    const vm = buildPccWarrantyTraceViewModel(envelope(SAMPLE_WARRANTY_TRACE_READ_MODEL));
    const insufficientRow = vm.traces.find(
      (t) => t.warrantyTraceId === SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD.warrantyTraceId,
    );
    expect(insufficientRow).toBeDefined();
    expect(insufficientRow!.status).toBe('insufficient-evidence');
    expect(insufficientRow!.isUnresolved).toBe(true);
    // Must not fabricate a recommendation when the source has none.
    expect(insufficientRow!.recommendation).toBe(
      SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD.recommendation,
    );
  });

  it('preserves recommendation when present (no stripping)', () => {
    const vm = buildPccWarrantyTraceViewModel(envelope(SAMPLE_WARRANTY_TRACE_READ_MODEL));
    const baseRow = vm.traces.find(
      (t) => t.warrantyTraceId === SAMPLE_WARRANTY_TRACE_RECORD.warrantyTraceId,
    );
    expect(baseRow).toBeDefined();
    expect(baseRow!.recommendation).toBe(SAMPLE_WARRANTY_TRACE_RECORD.recommendation);
  });

  it('isUnresolved true for insufficient-evidence / unresolved-responsibility / pending-evidence; false for resolved/closed', () => {
    const synthetic: PccWarrantyTraceReadModel = {
      traces: (
        ['insufficient-evidence', 'unresolved-responsibility', 'pending-evidence', 'resolved', 'closed'] as const
      ).map((status, i) => ({
        ...SAMPLE_WARRANTY_TRACE_RECORD,
        warrantyTraceId: `wt-${i}`,
        status,
      })),
    };
    const vm = buildPccWarrantyTraceViewModel(envelope(synthetic));
    expect(vm.traces.map((t) => t.isUnresolved)).toEqual([true, true, true, false, false]);
  });

  it('preserves redaction view (masked/withheld) on warranty rows', () => {
    const synthetic: PccWarrantyTraceReadModel = {
      traces: [
        { ...SAMPLE_WARRANTY_TRACE_RECORD, warrantyTraceId: 'wt-masked', security: MASKED_SECURITY },
        { ...SAMPLE_WARRANTY_TRACE_RECORD, warrantyTraceId: 'wt-withheld', security: WITHHELD_SECURITY },
      ],
    };
    const vm = buildPccWarrantyTraceViewModel(envelope(synthetic));
    expect(vm.traces[0]!.redaction.redacted).toBe(true);
    expect(vm.traces[1]!.redaction.withheld).toBe(true);
  });

  it('returns safe-empty for source-unavailable', () => {
    const vm = buildPccWarrantyTraceViewModel(envelope({ traces: [] }, 'source-unavailable'));
    expect(vm.traces).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Cross-project knowledge
// ─────────────────────────────────────────────────────────────────────

describe('buildPccCrossProjectKnowledgeViewModel', () => {
  it('preserves crossProjectAllowed, classification, redactionLevel on every reference', () => {
    const vm = buildPccCrossProjectKnowledgeViewModel(
      envelope(SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL),
    );
    expect(vm.crossProjectReferences[0]!.redaction.crossProjectAllowed).toBe(
      SAMPLE_CROSS_PROJECT_REFERENCE.security.crossProjectAllowed,
    );
    expect(vm.crossProjectReferences[0]!.redaction.classification).toBe(
      SAMPLE_CROSS_PROJECT_REFERENCE.security.classification,
    );
    expect(vm.knowledgeReferences[0]!.redaction.classification).toBe(
      SAMPLE_PROJECT_KNOWLEDGE_REFERENCE.security.classification,
    );
  });

  it('preserves closed-project + future-pursuit references with security posture', () => {
    const vm = buildPccCrossProjectKnowledgeViewModel(
      envelope(SAMPLE_CROSS_PROJECT_KNOWLEDGE_READ_MODEL),
    );
    expect(vm.closedProjectReferences.references[0]!.knowledgeId).toBe(
      SAMPLE_PROJECT_KNOWLEDGE_REFERENCE.knowledgeId,
    );
    expect(vm.closedProjectReferences.futurePursuitReferences[0]!.knowledgeId).toBe(
      SAMPLE_FUTURE_PURSUIT_KNOWLEDGE_REFERENCE.knowledgeId,
    );
    expect(vm.closedProjectReferences.references[0]!.redaction.redactionLevel).toBe(
      SAMPLE_PROJECT_KNOWLEDGE_REFERENCE.security.redactionLevel,
    );
  });

  it('exposes masked/withheld flags on synthetic references', () => {
    const synthetic: PccCrossProjectKnowledgeReadModel = {
      crossProjectReferences: [
        { ...SAMPLE_CROSS_PROJECT_REFERENCE, referenceId: 'cpr-masked', security: MASKED_SECURITY },
      ],
      knowledgeReferences: [
        { ...SAMPLE_PROJECT_KNOWLEDGE_REFERENCE, knowledgeId: 'k-withheld', security: WITHHELD_SECURITY },
      ],
      closedProjectReferences: { references: [], futurePursuitReferences: [] },
    };
    const vm = buildPccCrossProjectKnowledgeViewModel(envelope(synthetic));
    expect(vm.crossProjectReferences[0]!.redaction.redacted).toBe(true);
    expect(vm.knowledgeReferences[0]!.redaction.withheld).toBe(true);
  });

  it('returns safe-empty for source-unavailable', () => {
    const empty: PccCrossProjectKnowledgeReadModel = {
      crossProjectReferences: [],
      knowledgeReferences: [],
      closedProjectReferences: { references: [], futurePursuitReferences: [] },
    };
    const vm = buildPccCrossProjectKnowledgeViewModel(envelope(empty, 'source-unavailable'));
    expect(vm.crossProjectReferences).toEqual([]);
    expect(vm.closedProjectReferences.references).toEqual([]);
    expect(vm.closedProjectReferences.futurePursuitReferences).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Unified search (HBI grounding)
// ─────────────────────────────────────────────────────────────────────

describe('buildPccUnifiedSearchViewModel', () => {
  it('maps grounded answer with citations preserved', () => {
    const vm = buildPccUnifiedSearchViewModel(envelope(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL));
    const grounded = vm.answers.find((a) => a.kind === 'grounded');
    expect(grounded).toBeDefined();
    if (grounded?.kind !== 'grounded') throw new Error('expected grounded');
    expect(grounded.answerId).toBe(SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE.answerId);
    expect(grounded.citations).toBe(SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE.citations);
    expect(grounded.citations.length).toBeGreaterThan(0);
    // sourceLineage carried on each citation.
    for (const c of grounded.citations) {
      expect(c.sourceLineage).toBeDefined();
    }
  });

  it('maps refusal answer with refusalReason preserved and zero citations', () => {
    const vm = buildPccUnifiedSearchViewModel(envelope(SAMPLE_UNIFIED_SEARCH_ASK_HBI_READ_MODEL));
    const refusal = vm.answers.find((a) => a.kind === 'refusal');
    expect(refusal).toBeDefined();
    if (refusal?.kind !== 'refusal') throw new Error('expected refusal');
    expect(refusal.refusalReason).toBe(
      (SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE as { refusalReason: string }).refusalReason,
    );
    expect(refusal.citations).toEqual([]);
    expect(refusal.citations.length).toBe(0);
  });

  it('returns safe-empty for source-unavailable / backend-unavailable', () => {
    const empty: PccUnifiedSearchAskHbiReadModel = { responses: [] };
    expect(
      buildPccUnifiedSearchViewModel(envelope(empty, 'source-unavailable')).answers,
    ).toEqual([]);
    expect(
      buildPccUnifiedSearchViewModel(envelope(empty, 'backend-unavailable')).answers,
    ).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Aggregate
// ─────────────────────────────────────────────────────────────────────

describe('buildPccUnifiedLifecycleViewModel', () => {
  it('aggregates seven leaf VMs from a single unified-lifecycle envelope', () => {
    const vm = buildPccUnifiedLifecycleViewModel(envelope(SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL));
    expect(vm.sourceStatus).toBe('available');
    expect(vm.cardState).toBe('preview');
    expect(vm.lifecycleTimeline.events.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.lifecycleTimeline.events.length,
    );
    expect(vm.projectMemory.records.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.projectMemory.records.length,
    );
    expect(vm.projectLenses.lenses.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.projectLenses.stageLenses.length,
    );
    expect(vm.projectTraceability.edges.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.projectTraceability.edges.length,
    );
    expect(vm.warrantyTrace.traces.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.warrantyTrace.traces.length,
    );
    expect(vm.crossProjectKnowledge.crossProjectReferences.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.crossProjectKnowledge.crossProjectReferences.length,
    );
    expect(vm.unifiedSearch.answers.length).toBe(
      SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL.unifiedSearch.responses.length,
    );
  });

  it('propagates sourceStatus to every leaf VM (source-unavailable)', () => {
    const empty: PccUnifiedLifecycleReadModel = {
      lifecycleTimeline: { events: [], checkpoints: [], gateSignals: [], contextReferences: [] },
      projectMemory: { records: [], decisions: [], assumptions: [] },
      projectLenses: { stageLenses: [] },
      projectTraceability: {
        edges: [],
        clusters: [],
        graph: { edges: [], clusters: [] },
        relatedLifecycleEvents: [],
        relatedMemoryRecords: [],
      },
      warrantyTrace: { traces: [] },
      crossProjectKnowledge: {
        crossProjectReferences: [],
        knowledgeReferences: [],
        closedProjectReferences: { references: [], futurePursuitReferences: [] },
      },
      unifiedSearch: { responses: [] },
    };
    const vm = buildPccUnifiedLifecycleViewModel(envelope(empty, 'source-unavailable'));
    expect(vm.sourceStatus).toBe('source-unavailable');
    expect(vm.lifecycleTimeline.sourceStatus).toBe('source-unavailable');
    expect(vm.projectMemory.sourceStatus).toBe('source-unavailable');
    expect(vm.projectLenses.sourceStatus).toBe('source-unavailable');
    expect(vm.projectTraceability.sourceStatus).toBe('source-unavailable');
    expect(vm.warrantyTrace.sourceStatus).toBe('source-unavailable');
    expect(vm.crossProjectKnowledge.sourceStatus).toBe('source-unavailable');
    expect(vm.unifiedSearch.sourceStatus).toBe('source-unavailable');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Adapter VM unions never include 'loading'
// ─────────────────────────────────────────────────────────────────────

describe('adapter VMs never expose async statuses', () => {
  it('no leaf VM exposes status: loading or status: error in its serialized shape', () => {
    const vm = buildPccUnifiedLifecycleViewModel(envelope(SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL));
    const serialized = JSON.stringify(vm);
    // Only sourceStatus / cardState are status-bearing fields. Adapters
    // cannot produce 'loading' from an envelope.
    expect(serialized).not.toMatch(/"status":\s*"loading"/);
    expect(serialized).not.toMatch(/"status":\s*"error"/);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Source-scan: forbidden non-canonical route ids absent from adapter sources
// ─────────────────────────────────────────────────────────────────────

describe('unified lifecycle adapter source files', () => {
  const SEAM_DIR = resolve(SRC_ROOT, 'surfaces', 'unifiedLifecycle');

  function listSeamFiles(): string[] {
    const out: string[] = [];
    for (const name of readdirSync(SEAM_DIR)) {
      const full = join(SEAM_DIR, name);
      if (statSync(full).isFile() && /\.ts$/.test(name) && !/\.test\.ts$/.test(name)) {
        out.push(full);
      }
    }
    return out;
  }

  function stripCommentsAndStrings(src: string): string {
    // Strip /* ... */, // ..., and single/double/backtick string literals so
    // that prose mentions in docblocks don't trip identifier scans (per
    // memory feedback_source_scan_guards_strip_comments).
    return src
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/.*$/gm, ' ')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/`(?:[^`\\]|\\.)*`/g, '``');
  }

  it('no adapter source file quotes the forbidden non-canonical route ids', () => {
    const forbidden = ['lifecycle-timeline', 'traceability-graph', 'closed-project-references'];
    for (const file of listSeamFiles()) {
      const src = readFileSync(file, 'utf8');
      // Quoted-literal scan: comments allowed to mention these in prose,
      // but never as live string literals.
      for (const f of forbidden) {
        const quoted = new RegExp(`['"\`]${f}['"\`]`);
        expect(quoted.test(stripCommentsAndStrings(src) + ' ' + src)).toBe(false);
      }
    }
  });

  it('every adapter source file declares the shared-seam / non-routed posture in its top docblock', () => {
    for (const file of listSeamFiles()) {
      const src = readFileSync(file, 'utf8');
      expect(src).toContain('SHARED ADAPTER SEAM');
      expect(src).toContain('NOT A ROUTED SURFACE');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Router non-registration: adapter seam is not a routed surface
// ─────────────────────────────────────────────────────────────────────

describe('unified lifecycle is not registered with PccSurfaceRouter', () => {
  it('PccSurfaceRouter.tsx does not reference unifiedLifecycle as a routed surface', () => {
    const routerPath = resolve(SRC_ROOT, 'shell', 'PccSurfaceRouter.tsx');
    const src = readFileSync(routerPath, 'utf8');
    expect(src).not.toMatch(/unifiedLifecycle/i);
    expect(src).not.toContain('unified-lifecycle');
  });
});
