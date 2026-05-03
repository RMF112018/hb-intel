import { describe, expect, it } from 'vitest';
import {
  PCC_CROSS_PROJECT_REFERENCE_STATUSES,
  PCC_LIFECYCLE_EVENT_STATUSES,
  PCC_MEMORY_RECORD_STATUSES,
  PCC_MEMORY_RECORD_TYPES,
  PCC_PROJECT_KNOWLEDGE_REFERENCE_TYPES,
  PCC_PROJECT_LENS_TYPES,
  PCC_PROJECT_LENS_VISIBILITY_MODES,
  PCC_PROJECT_LIFECYCLE_STAGES,
  PCC_LIFECYCLE_STAGE_PROJECT_STAGE_MAP,
  PCC_TRACEABLE_RECORD_TYPES,
  PCC_TRACEABILITY_CONFIDENCE,
  PCC_TRACEABILITY_DIRECTIONS,
  PCC_LIFECYCLE_CHECKPOINT_STATUSES,
  PCC_LIFECYCLE_EVENT_TYPES,
  PCC_LIFECYCLE_GATE_SIGNAL_STATUSES,
  PCC_REDACTION_LEVELS,
  PCC_REFERENCE_CLASSIFICATIONS,
  PCC_SECURITY_CLASSIFICATIONS,
  PCC_TRACEABILITY_EDGE_TYPES,
  PCC_WARRANTY_TRACE_STATUSES,
  type UnifiedSearchAskHbiResponse,
} from './UnifiedLifecycle.js';
import {
  SAMPLE_PROJECT_LIFECYCLE_EVENTS,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_ASSUMPTION_RECORD,
  SAMPLE_PROJECT_ASSUMPTION_RECORDS,
  SAMPLE_PROJECT_STAGE_LENS,
  SAMPLE_WARRANTY_TRACE_RECORD,
  SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD,
  SAMPLE_PROJECT_TRACEABILITY_EDGES,
  SAMPLE_RELATED_RECORD_CLUSTER,
  SAMPLE_CROSS_PROJECT_REFERENCE,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
} from './fixtures/unifiedLifecycle.js';
import { PCC_PROJECT_STAGES } from './PccProjectEnums.js';

describe('UnifiedLifecycle vocabularies', () => {
  it('contains stable lifecycle event vocabulary', () => {
    expect(PCC_LIFECYCLE_EVENT_TYPES).toEqual([
      'stage-transition',
      'decision',
      'assumption',
      'readiness-gate',
      'external-system-milestone',
      'evidence-capture',
      'risk-constraint-signal',
      'warranty-signal',
      'knowledge-reuse-signal',
    ]);
    expect(PCC_LIFECYCLE_CHECKPOINT_STATUSES).toContain('ready-for-review');
    expect(PCC_LIFECYCLE_GATE_SIGNAL_STATUSES).toContain('pass');
    expect(PCC_TRACEABILITY_EDGE_TYPES).toContain('derived-from');
    expect(PCC_WARRANTY_TRACE_STATUSES).toContain('insufficient-evidence');
    expect(PCC_REFERENCE_CLASSIFICATIONS).toContain('cross-project');
    expect(PCC_SECURITY_CLASSIFICATIONS).toContain('need-to-know');
    expect(PCC_REDACTION_LEVELS).toContain('withheld');
    expect(PCC_LIFECYCLE_EVENT_STATUSES).toContain('pending-review');
    expect(PCC_MEMORY_RECORD_TYPES).toContain('warranty-reference');
    expect(PCC_MEMORY_RECORD_STATUSES).toContain('converted-to-action');
    expect(PCC_PROJECT_LENS_TYPES).toContain('future-pursuit-reference');
    expect(PCC_PROJECT_LENS_VISIBILITY_MODES).toContain('redacted-summary');
    expect(PCC_TRACEABLE_RECORD_TYPES).toContain('estimate-line-item');
    expect(PCC_TRACEABILITY_DIRECTIONS).toContain('bidirectional');
    expect(PCC_TRACEABILITY_CONFIDENCE).toContain('verified');
    expect(PCC_PROJECT_KNOWLEDGE_REFERENCE_TYPES).toContain('pursuit-reference');
    expect(PCC_CROSS_PROJECT_REFERENCE_STATUSES).toContain('restricted');
  });

  it('includes required lifecycle, memory, lens, traceability, and cross-project vocabularies', () => {
    const mustHaveLifecycle = [
      'lead-pursuit',
      'pursuit-go-no-go',
      'estimating',
      'preconstruction',
      'project-setup',
      'active-construction',
      'closeout',
      'warranty',
      'archive',
      'future-reference',
    ] as const;
    for (const token of mustHaveLifecycle) expect(PCC_PROJECT_LIFECYCLE_STAGES.includes(token)).toBe(true);

    const mustHaveMemory = [
      'decision',
      'assumption',
      'obligation',
      'risk',
      'constraint',
      'vendor-selection',
      'product-selection',
      'estimate-reference',
      'scope-reference',
      'change-reference',
      'inspection-reference',
      'closeout-reference',
      'warranty-reference',
      'lesson-learned',
      'executive-note',
      'pursuit-note',
    ] as const;
    for (const token of mustHaveMemory) expect(PCC_MEMORY_RECORD_TYPES.includes(token)).toBe(true);

    const mustHaveLens = [
      'estimating',
      'preconstruction',
      'operations',
      'field',
      'accounting',
      'closeout',
      'warranty',
      'executive',
      'admin',
      'future-pursuit-reference',
    ] as const;
    for (const token of mustHaveLens) expect(PCC_PROJECT_LENS_TYPES.includes(token)).toBe(true);

    const mustHaveTraceable = [
      'estimate-line-item',
      'estimate-assembly',
      'bid-package',
      'scope-package',
      'subcontractor-bid',
      'commitment',
      'purchase-order',
      'vendor',
      'subcontractor',
      'product-material',
      'submittal',
      'rfi',
      'asi-ccd-change-event',
      'inspection',
      'constraint',
      'responsibility-matrix-item',
      'punch-item',
      'closeout-document',
      'warranty-claim',
      'lesson-learned',
      'project-memory-record',
      'lifecycle-event',
    ] as const;
    for (const token of mustHaveTraceable) expect(PCC_TRACEABLE_RECORD_TYPES.includes(token)).toBe(true);
  });

  it('keeps PccProjectStage as frozen six-value MVP enum and maps lifecycle stages explicitly', () => {
    expect(PCC_PROJECT_STAGES).toEqual([
      'lead',
      'estimating',
      'preconstruction',
      'active_construction',
      'closeout',
      'warranty',
    ]);
    expect(PCC_PROJECT_LIFECYCLE_STAGES).toContain('pursuit-go-no-go');
    expect(PCC_LIFECYCLE_STAGE_PROJECT_STAGE_MAP['pursuit-go-no-go']).toBe('lead');
    expect(PCC_LIFECYCLE_STAGE_PROJECT_STAGE_MAP.archive).toBeNull();
  });
});

describe('UnifiedLifecycle doctrine invariants', () => {
  it('keeps records anchored to one project operating layer', () => {
    expect(SAMPLE_PROJECT_DECISION_RECORD.projectId).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]?.projectId);
    expect(SAMPLE_PROJECT_ASSUMPTION_RECORD.projectId).toBe(
      SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]?.projectId,
    );
    expect(SAMPLE_WARRANTY_TRACE_RECORD.projectId).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]?.projectId);
  });

  it('uses role-stage-task lenses over shared lifecycle records', () => {
    expect(SAMPLE_PROJECT_STAGE_LENS.lifecycleStage).toBe('active-construction');
    expect(SAMPLE_PROJECT_STAGE_LENS.includedEventIds).toContain(SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]?.eventId);
    expect(SAMPLE_PROJECT_STAGE_LENS.includedMemoryIds).toContain(SAMPLE_PROJECT_DECISION_RECORD.memoryId);
  });

  it('requires grounded answers to include lineage citations', () => {
    const grounded = SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE;
    expect(grounded.grounded).toBe(true);
    expect(grounded.refused).toBe(false);
    if (grounded.grounded) {
      expect(grounded.citations.length).toBeGreaterThan(0);
      expect(grounded.citations[0]?.sourceLineage.sourceRecordId.length).toBeGreaterThan(0);
    }
  });

  it('uses refusal response when grounded lineage is unavailable', () => {
    const refusal = SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE;
    expect(refusal.grounded).toBe(false);
    expect(refusal.refused).toBe(true);
    if (!refusal.grounded) {
      expect(refusal.citations).toHaveLength(0);
      expect(refusal.refusalReason.length).toBeGreaterThan(0);
    }
  });

  it('keeps cross-project references permission-scoped', () => {
    expect(SAMPLE_CROSS_PROJECT_REFERENCE.security.crossProjectAllowed).toBe(true);
    expect(SAMPLE_PROJECT_KNOWLEDGE_REFERENCE.security.classification).toBe('need-to-know');
  });

  it('supports full assumption status lifecycle', () => {
    const statuses = new Set(SAMPLE_PROJECT_ASSUMPTION_RECORDS.map((r) => r.status));
    expect(statuses.has('open')).toBe(true);
    expect(statuses.has('validated')).toBe(true);
    expect(statuses.has('invalidated')).toBe(true);
    expect(statuses.has('superseded')).toBe(true);
    expect(statuses.has('converted-to-action')).toBe(true);
  });

  it('enforces evidence-backed warranty recommendations and unresolved posture', () => {
    expect(SAMPLE_WARRANTY_TRACE_RECORD.recommendation?.confidence).toBeDefined();
    expect((SAMPLE_WARRANTY_TRACE_RECORD.recommendation?.evidenceLinkIds.length ?? 0) > 0).toBe(true);
    expect(SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD.status).toBe('insufficient-evidence');
    expect(SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD.recommendation).toBeUndefined();
  });

  it('traceability edges use recognized record types and cluster links remain coherent', () => {
    const knownEdgeIds = new Set(SAMPLE_PROJECT_TRACEABILITY_EDGES.map((e) => e.edgeId));
    for (const edge of SAMPLE_PROJECT_TRACEABILITY_EDGES) {
      expect(PCC_TRACEABLE_RECORD_TYPES.includes(edge.fromRecordType)).toBe(true);
      expect(PCC_TRACEABLE_RECORD_TYPES.includes(edge.toRecordType)).toBe(true);
    }
    for (const edgeId of SAMPLE_RELATED_RECORD_CLUSTER.edgeIds) {
      expect(knownEdgeIds.has(edgeId)).toBe(true);
    }
  });

  it('ensures no source-of-record duplication claims in fixture responses', () => {
    const responses: readonly UnifiedSearchAskHbiResponse[] = [
      SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
      SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
    ];
    for (const response of responses) {
      expect(response.response.toLowerCase()).not.toContain('system of record');
    }
  });
});
