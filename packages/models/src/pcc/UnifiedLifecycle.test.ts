import { describe, expect, it } from 'vitest';
import {
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
  SAMPLE_PROJECT_LIFECYCLE_EVENT,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_ASSUMPTION_RECORD,
  SAMPLE_PROJECT_STAGE_LENS,
  SAMPLE_WARRANTY_TRACE_RECORD,
  SAMPLE_CROSS_PROJECT_REFERENCE,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
} from './fixtures/unifiedLifecycle.js';

describe('UnifiedLifecycle vocabularies', () => {
  it('contains stable lifecycle event vocabulary', () => {
    expect(PCC_LIFECYCLE_EVENT_TYPES).toEqual([
      'checkpoint-opened',
      'checkpoint-closed',
      'decision-recorded',
      'assumption-recorded',
      'risk-raised',
      'handoff-completed',
      'warranty-issue-linked',
      'knowledge-captured',
    ]);
    expect(PCC_LIFECYCLE_CHECKPOINT_STATUSES).toContain('ready-for-review');
    expect(PCC_LIFECYCLE_GATE_SIGNAL_STATUSES).toContain('pass');
    expect(PCC_TRACEABILITY_EDGE_TYPES).toContain('supported-by');
    expect(PCC_WARRANTY_TRACE_STATUSES).toContain('investigating');
    expect(PCC_REFERENCE_CLASSIFICATIONS).toContain('cross-project');
    expect(PCC_SECURITY_CLASSIFICATIONS).toContain('need-to-know');
    expect(PCC_REDACTION_LEVELS).toContain('withheld');
  });
});

describe('UnifiedLifecycle doctrine invariants', () => {
  it('keeps records anchored to one project operating layer', () => {
    expect(SAMPLE_PROJECT_DECISION_RECORD.projectId).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENT.projectId);
    expect(SAMPLE_PROJECT_ASSUMPTION_RECORD.projectId).toBe(
      SAMPLE_PROJECT_LIFECYCLE_EVENT.projectId,
    );
    expect(SAMPLE_WARRANTY_TRACE_RECORD.projectId).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENT.projectId);
  });

  it('uses role-stage-task lenses over shared lifecycle records', () => {
    expect(SAMPLE_PROJECT_STAGE_LENS.stage).toBe(SAMPLE_PROJECT_LIFECYCLE_EVENT.stage);
    expect(SAMPLE_PROJECT_STAGE_LENS.includedEventIds).toContain(SAMPLE_PROJECT_LIFECYCLE_EVENT.eventId);
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
