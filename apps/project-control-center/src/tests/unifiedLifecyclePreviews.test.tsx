/**
 * Unified Lifecycle preview components — rendering test suite (Wave 99 / Prompt 04C).
 *
 * Reuses the canonical `@hbc/models/pcc` envelopes for the available
 * branch and builds local synthetic envelopes inline for degraded /
 * masked / withheld and grounded-vs-refusal cases. Components are
 * rendered as card BODY content directly into a host `<div>` — no
 * PccDashboardCard or PccBentoGrid wrapper, since those are the
 * future consumer's concern (Prompt 05).
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import {
  SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE,
  SAMPLE_PROJECT_LENSES_ENVELOPE,
  SAMPLE_PROJECT_LIFECYCLE_TIMELINE_ENVELOPE,
  SAMPLE_PROJECT_MEMORY_ENVELOPE,
  SAMPLE_PROJECT_TRACEABILITY_ENVELOPE,
  SAMPLE_UNIFIED_SEARCH_ENVELOPE,
  SAMPLE_WARRANTY_TRACE_ENVELOPE,
  SAMPLE_PROJECT_LIFECYCLE_EVENTS,
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
  SAMPLE_FUTURE_PURSUIT_KNOWLEDGE_REFERENCE,
  SAMPLE_WARRANTY_TRACE_RECORD,
  SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD,
  SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE,
  SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE,
} from '@hbc/models/pcc';
import type {
  PccCrossProjectKnowledgeReadModel,
  PccProjectId,
  PccProjectLensesReadModel,
  PccProjectLifecycleTimelineReadModel,
  PccProjectMemoryReadModel,
  PccProjectTraceabilityReadModel,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccSecurityPosture,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
} from '@hbc/models/pcc';
import {
  buildPccCrossProjectKnowledgeViewModel,
  buildPccLifecycleTimelineViewModel,
  buildPccProjectLensesViewModel,
  buildPccProjectMemoryViewModel,
  buildPccProjectTraceabilityViewModel,
  buildPccUnifiedSearchViewModel,
  buildPccWarrantyTraceViewModel,
  ClosedProjectReferencePreview,
  LifecycleTimelinePreview,
  ProjectLensSwitcher,
  ProjectMemoryPanel,
  RelatedRecordsPanel,
  UnifiedProjectSearchPreview,
  WarrantyTracePreview,
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
    viewerPersona: 'project-manager',
    warnings: [],
    generatedAtUtc: GENERATED_AT,
    data,
  };
}

const SECURITY_NONE: PccSecurityPosture = {
  classification: 'project-internal',
  allowedPersonas: ['project-manager'],
  redactionLevel: 'none',
  crossProjectAllowed: false,
};

const SECURITY_MASKED: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive'],
  redactionLevel: 'masked',
  crossProjectAllowed: false,
};

const SECURITY_WITHHELD: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive'],
  redactionLevel: 'withheld',
  crossProjectAllowed: false,
};

// ─────────────────────────────────────────────────────────────────────
// LifecycleTimelinePreview
// ─────────────────────────────────────────────────────────────────────

describe('LifecycleTimelinePreview', () => {
  it('renders fixture-backed events without crashing', () => {
    const vm = buildPccLifecycleTimelineViewModel(SAMPLE_PROJECT_LIFECYCLE_TIMELINE_ENVELOPE);
    const { container } = render(<LifecycleTimelinePreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-pcc-lifecycle-event-id]').length,
    ).toBeGreaterThan(0);
  });

  it('source-unavailable envelope renders preview state and no event rows', () => {
    const vm = buildPccLifecycleTimelineViewModel(
      envelope<PccProjectLifecycleTimelineReadModel>(
        SAMPLE_PROJECT_LIFECYCLE_TIMELINE_ENVELOPE.data,
        'source-unavailable',
      ),
    );
    const { container } = render(<LifecycleTimelinePreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-state]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-lifecycle-event-id]')).toBeNull();
  });

  it('masked event renders Restricted pill and withholds summary; withheld event is omitted', () => {
    const baseEvent = SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]!;
    const maskedEvent = {
      ...baseEvent,
      eventId: 'TST-EVT-MASKED',
      summary: 'Sensitive lifecycle entry — DO NOT EXPOSE',
      security: SECURITY_MASKED,
    };
    const withheldEvent = {
      ...baseEvent,
      eventId: 'TST-EVT-WITHHELD',
      summary: 'Sensitive lifecycle entry — WITHHELD',
      security: SECURITY_WITHHELD,
    };
    const vm = buildPccLifecycleTimelineViewModel(
      envelope<PccProjectLifecycleTimelineReadModel>({
        events: [maskedEvent, withheldEvent],
        checkpoints: [],
        gateSignals: [],
        contextReferences: [],
      }),
    );
    const { container } = render(<LifecycleTimelinePreview viewModel={vm} />);
    expect(
      container.querySelector('[data-pcc-lifecycle-event-id="TST-EVT-MASKED"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-pcc-lifecycle-event-id="TST-EVT-WITHHELD"]'),
    ).toBeNull();
    expect(container.textContent ?? '').not.toContain('DO NOT EXPOSE');
    expect(container.textContent ?? '').not.toContain('WITHHELD');
    expect(container.textContent ?? '').toContain('Restricted');
  });

  it('renders source-lineage chip for unredacted events', () => {
    const event = {
      ...SAMPLE_PROJECT_LIFECYCLE_EVENTS[0]!,
      security: SECURITY_NONE,
    };
    const vm = buildPccLifecycleTimelineViewModel(
      envelope<PccProjectLifecycleTimelineReadModel>({
        events: [event],
        checkpoints: [],
        gateSignals: [],
        contextReferences: [],
      }),
    );
    const { container } = render(<LifecycleTimelinePreview viewModel={vm} />);
    expect(container.textContent ?? '').toContain(event.sourceLineage!.sourceSystem);
  });
});

// ─────────────────────────────────────────────────────────────────────
// ProjectMemoryPanel
// ─────────────────────────────────────────────────────────────────────

describe('ProjectMemoryPanel', () => {
  it('renders fixture-backed records without crashing', () => {
    const vm = buildPccProjectMemoryViewModel(SAMPLE_PROJECT_MEMORY_ENVELOPE);
    const { container } = render(<ProjectMemoryPanel viewModel={vm} />);
    expect(container.querySelector('[data-pcc-project-memory]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-project-memory-decisions]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-project-memory-assumptions]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-pcc-memory-record-id]').length,
    ).toBeGreaterThan(0);
  });

  it('masked decision withholds decision text but renders Restricted pill', () => {
    const maskedDecision = {
      ...SAMPLE_PROJECT_DECISION_RECORD,
      memoryId: 'TST-MEM-MASKED',
      summary: 'Restricted decision summary',
      decision: 'SENSITIVE_DECISION_TEXT_DO_NOT_EXPOSE',
      impactStatement: 'SENSITIVE_IMPACT_DO_NOT_EXPOSE',
      security: SECURITY_MASKED,
    };
    const vm = buildPccProjectMemoryViewModel(
      envelope<PccProjectMemoryReadModel>({
        records: [maskedDecision],
        decisions: [maskedDecision],
        assumptions: [],
      }),
    );
    const { container } = render(<ProjectMemoryPanel viewModel={vm} />);
    expect(
      container.querySelector('[data-pcc-memory-record-id="TST-MEM-MASKED"]'),
    ).not.toBeNull();
    expect(container.textContent ?? '').not.toContain('SENSITIVE_DECISION_TEXT_DO_NOT_EXPOSE');
    expect(container.textContent ?? '').not.toContain('SENSITIVE_IMPACT_DO_NOT_EXPOSE');
    expect(container.textContent ?? '').toContain('Restricted');
  });

  it('withheld memory record is omitted entirely', () => {
    const withheldDecision = {
      ...SAMPLE_PROJECT_DECISION_RECORD,
      memoryId: 'TST-MEM-WITHHELD',
      security: SECURITY_WITHHELD,
    };
    const vm = buildPccProjectMemoryViewModel(
      envelope<PccProjectMemoryReadModel>({
        records: [withheldDecision],
        decisions: [withheldDecision],
        assumptions: [],
      }),
    );
    const { container } = render(<ProjectMemoryPanel viewModel={vm} />);
    expect(
      container.querySelector('[data-pcc-memory-record-id="TST-MEM-WITHHELD"]'),
    ).toBeNull();
    expect(container.querySelector('[data-pcc-state]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// ProjectLensSwitcher
// ─────────────────────────────────────────────────────────────────────

describe('ProjectLensSwitcher', () => {
  it('renders lens buttons that are all disabled with preview-disabled action state', () => {
    const vm = buildPccProjectLensesViewModel(SAMPLE_PROJECT_LENSES_ENVELOPE);
    const { container } = render(<ProjectLensSwitcher viewModel={vm} />);
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-pcc-lens-id]');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of Array.from(buttons)) {
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('data-pcc-action-state')).toBe('preview-disabled');
    }
  });

  it('clicking a lens does not mutate aria-pressed and does not navigate', () => {
    const vm = buildPccProjectLensesViewModel(SAMPLE_PROJECT_LENSES_ENVELOPE);
    const { container } = render(<ProjectLensSwitcher viewModel={vm} />);
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-pcc-lens-id]');
    const before = Array.from(buttons).map((b) => b.getAttribute('aria-pressed'));
    fireEvent.click(buttons[0]!);
    fireEvent.click(buttons[buttons.length - 1]!);
    const after = Array.from(buttons).map((b) => b.getAttribute('aria-pressed'));
    expect(after).toEqual(before);
  });

  it('renders no anchor links and no onclick affordances', () => {
    const vm = buildPccProjectLensesViewModel(SAMPLE_PROJECT_LENSES_ENVELOPE);
    const { container } = render(<ProjectLensSwitcher viewModel={vm} />);
    expect(container.querySelectorAll('a[href]').length).toBe(0);
    const interactive = container.querySelectorAll<HTMLElement>('[onclick]');
    expect(interactive.length).toBe(0);
  });

  it('source-unavailable envelope renders preview state and no lens buttons', () => {
    const vm = buildPccProjectLensesViewModel(
      envelope<PccProjectLensesReadModel>(
        SAMPLE_PROJECT_LENSES_ENVELOPE.data,
        'source-unavailable',
      ),
    );
    const { container } = render(<ProjectLensSwitcher viewModel={vm} />);
    expect(container.querySelector('[data-pcc-state]')).not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-lens-id]').length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// RelatedRecordsPanel
// ─────────────────────────────────────────────────────────────────────

describe('RelatedRecordsPanel', () => {
  it('renders clusters, related events, and related memory records', () => {
    const vm = buildPccProjectTraceabilityViewModel(SAMPLE_PROJECT_TRACEABILITY_ENVELOPE);
    const { container } = render(<RelatedRecordsPanel viewModel={vm} />);
    expect(container.querySelector('[data-pcc-related-records]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-pcc-related-records-cluster-id]').length,
    ).toBeGreaterThan(0);
    expect(container.querySelector('[data-pcc-related-records-events]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-related-records-memory]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-pcc-trace-edge-id]').length,
    ).toBeGreaterThan(0);
  });

  it('source-unavailable envelope renders preview state and no clusters', () => {
    const vm = buildPccProjectTraceabilityViewModel(
      envelope<PccProjectTraceabilityReadModel>(
        SAMPLE_PROJECT_TRACEABILITY_ENVELOPE.data,
        'source-unavailable',
      ),
    );
    const { container } = render(<RelatedRecordsPanel viewModel={vm} />);
    expect(container.querySelector('[data-pcc-state]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-related-records-cluster-id]')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// WarrantyTracePreview
// ─────────────────────────────────────────────────────────────────────

describe('WarrantyTracePreview', () => {
  it('renders fixture-backed traces and shows insufficient-evidence rows without a responsible-party recommendation', () => {
    const vm = buildPccWarrantyTraceViewModel(SAMPLE_WARRANTY_TRACE_ENVELOPE);
    const { container } = render(<WarrantyTracePreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-warranty-trace]')).not.toBeNull();
    const insufficient = container.querySelector(
      `[data-pcc-warranty-trace-id="${SAMPLE_WARRANTY_TRACE_INSUFFICIENT_EVIDENCE_RECORD.warrantyTraceId}"]`,
    );
    expect(insufficient).not.toBeNull();
    expect(
      insufficient!.querySelector(
        '[data-pcc-warranty-recommendation-state="insufficient-evidence"]',
      ),
    ).not.toBeNull();
    expect(
      insufficient!.querySelector('[data-pcc-warranty-recommendation-state="present"]'),
    ).toBeNull();
    expect(insufficient!.textContent ?? '').toContain(
      'Insufficient evidence — no responsible party assigned.',
    );
  });

  it('renders the responsible-party recommendation only when the row is resolved with a recommendation', () => {
    const resolvedRecord = {
      ...SAMPLE_WARRANTY_TRACE_RECORD,
      warrantyTraceId: 'TST-WT-RESOLVED',
      status: 'resolved' as const,
      recommendation: SAMPLE_WARRANTY_TRACE_RECORD.recommendation ?? {
        recommendedResponsibleRecordId: 'sub-1',
        recommendedResponsibleType: 'subcontractor' as const,
        confidence: 'high' as const,
        evidenceLinkIds: [],
      },
    };
    const vm = buildPccWarrantyTraceViewModel(
      envelope<PccWarrantyTraceReadModel>({ traces: [resolvedRecord] }),
    );
    const { container } = render(<WarrantyTracePreview viewModel={vm} />);
    const row = container.querySelector(
      '[data-pcc-warranty-trace-id="TST-WT-RESOLVED"]',
    );
    expect(row).not.toBeNull();
    expect(
      row!.querySelector('[data-pcc-warranty-recommendation-state="present"]'),
    ).not.toBeNull();
    expect(row!.textContent ?? '').toContain(
      resolvedRecord.recommendation.recommendedResponsibleType,
    );
  });

  it('withheld trace is omitted entirely', () => {
    const withheld = {
      ...SAMPLE_WARRANTY_TRACE_RECORD,
      warrantyTraceId: 'TST-WT-WITHHELD',
      issueSummary: 'WITHHELD_ISSUE_DO_NOT_EXPOSE',
      security: SECURITY_WITHHELD,
    };
    const vm = buildPccWarrantyTraceViewModel(
      envelope<PccWarrantyTraceReadModel>({ traces: [withheld] }),
    );
    const { container } = render(<WarrantyTracePreview viewModel={vm} />);
    expect(
      container.querySelector('[data-pcc-warranty-trace-id="TST-WT-WITHHELD"]'),
    ).toBeNull();
    expect(container.textContent ?? '').not.toContain('WITHHELD_ISSUE_DO_NOT_EXPOSE');
  });
});

// ─────────────────────────────────────────────────────────────────────
// ClosedProjectReferencePreview
// ─────────────────────────────────────────────────────────────────────

describe('ClosedProjectReferencePreview', () => {
  it('renders both closed-project and future-pursuit reference sections', () => {
    const vm = buildPccCrossProjectKnowledgeViewModel(SAMPLE_CROSS_PROJECT_KNOWLEDGE_ENVELOPE);
    const { container } = render(<ClosedProjectReferencePreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-closed-project-reference]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-closed-project-references]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-future-pursuit-references]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-pcc-cross-project-reference-id]').length,
    ).toBeGreaterThan(0);
  });

  it('unredacted reference renders title and tags; masked reference withholds title and renders Restricted pill', () => {
    const unredactedRef = {
      ...SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
      knowledgeId: 'TST-KNW-OPEN',
      title: 'Open envelope warranty pattern',
      summary: 'Visible summary content',
      security: SECURITY_NONE,
    };
    const maskedRef = {
      ...SAMPLE_FUTURE_PURSUIT_KNOWLEDGE_REFERENCE,
      knowledgeId: 'TST-KNW-MASKED',
      title: 'SENSITIVE_TITLE_DO_NOT_EXPOSE',
      summary: 'SENSITIVE_SUMMARY_DO_NOT_EXPOSE',
      security: SECURITY_MASKED,
    };
    const vm = buildPccCrossProjectKnowledgeViewModel(
      envelope<PccCrossProjectKnowledgeReadModel>({
        crossProjectReferences: [],
        knowledgeReferences: [],
        closedProjectReferences: {
          references: [unredactedRef],
          futurePursuitReferences: [maskedRef],
        },
      }),
    );
    const { container } = render(<ClosedProjectReferencePreview viewModel={vm} />);
    expect(container.textContent ?? '').toContain('Open envelope warranty pattern');
    expect(container.textContent ?? '').toContain('Visible summary content');
    expect(container.textContent ?? '').not.toContain('SENSITIVE_TITLE_DO_NOT_EXPOSE');
    expect(container.textContent ?? '').not.toContain('SENSITIVE_SUMMARY_DO_NOT_EXPOSE');
    expect(container.textContent ?? '').toContain('Restricted');
  });

  it('withheld reference is omitted entirely', () => {
    const withheldRef = {
      ...SAMPLE_PROJECT_KNOWLEDGE_REFERENCE,
      knowledgeId: 'TST-KNW-WITHHELD',
      title: 'WITHHELD_TITLE_DO_NOT_EXPOSE',
      security: SECURITY_WITHHELD,
    };
    const vm = buildPccCrossProjectKnowledgeViewModel(
      envelope<PccCrossProjectKnowledgeReadModel>({
        crossProjectReferences: [],
        knowledgeReferences: [],
        closedProjectReferences: {
          references: [withheldRef],
          futurePursuitReferences: [],
        },
      }),
    );
    const { container } = render(<ClosedProjectReferencePreview viewModel={vm} />);
    expect(
      container.querySelector('[data-pcc-cross-project-reference-id="TST-KNW-WITHHELD"]'),
    ).toBeNull();
    expect(container.textContent ?? '').not.toContain('WITHHELD_TITLE_DO_NOT_EXPOSE');
  });
});

// ─────────────────────────────────────────────────────────────────────
// UnifiedProjectSearchPreview
// ─────────────────────────────────────────────────────────────────────

describe('UnifiedProjectSearchPreview', () => {
  it('renders grounded answer with citation chips', () => {
    const vm = buildPccUnifiedSearchViewModel(SAMPLE_UNIFIED_SEARCH_ENVELOPE);
    const { container } = render(<UnifiedProjectSearchPreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-unified-search]')).not.toBeNull();
    const grounded = container.querySelector(
      `[data-pcc-unified-search-answer-id="${SAMPLE_UNIFIED_SEARCH_GROUNDED_RESPONSE.answerId}"]`,
    );
    expect(grounded).not.toBeNull();
    expect(grounded!.getAttribute('data-pcc-unified-search-answer-kind')).toBe('grounded');
    expect(
      grounded!.querySelectorAll('[data-pcc-unified-search-citation-id]').length,
    ).toBeGreaterThan(0);
  });

  it('refusal answer renders refusal reason and zero citations', () => {
    const vm = buildPccUnifiedSearchViewModel(SAMPLE_UNIFIED_SEARCH_ENVELOPE);
    const { container } = render(<UnifiedProjectSearchPreview viewModel={vm} />);
    const refusal = container.querySelector(
      `[data-pcc-unified-search-answer-id="${SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE.answerId}"]`,
    );
    expect(refusal).not.toBeNull();
    expect(refusal!.getAttribute('data-pcc-unified-search-answer-kind')).toBe('refusal');
    expect(
      refusal!.querySelectorAll('[data-pcc-unified-search-citation-id]').length,
    ).toBe(0);
    expect(SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE.refused).toBe(true);
    if (SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE.refused) {
      expect(refusal!.textContent ?? '').toContain(
        SAMPLE_UNIFIED_SEARCH_REFUSAL_RESPONSE.refusalReason,
      );
    }
  });

  it('renders no query input control (deferred to Prompt 05)', () => {
    const vm = buildPccUnifiedSearchViewModel(SAMPLE_UNIFIED_SEARCH_ENVELOPE);
    const { container } = render(<UnifiedProjectSearchPreview viewModel={vm} />);
    expect(container.querySelectorAll('input').length).toBe(0);
    expect(container.querySelectorAll('textarea').length).toBe(0);
    expect(container.querySelectorAll('form').length).toBe(0);
  });

  it('source-unavailable envelope renders preview state and no answer rows', () => {
    const vm = buildPccUnifiedSearchViewModel(
      envelope<PccUnifiedSearchAskHbiReadModel>(
        SAMPLE_UNIFIED_SEARCH_ENVELOPE.data,
        'source-unavailable',
      ),
    );
    const { container } = render(<UnifiedProjectSearchPreview viewModel={vm} />);
    expect(container.querySelector('[data-pcc-state]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-unified-search-answer-id]')).toBeNull();
  });
});
