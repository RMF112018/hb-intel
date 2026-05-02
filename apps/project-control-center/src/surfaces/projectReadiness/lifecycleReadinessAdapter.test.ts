import { describe, expect, it } from 'vitest';
import {
  LIFECYCLE_READINESS_LIBRARY_METADATA,
  LIFECYCLE_READINESS_PHASES,
  LIFECYCLE_READINESS_STATUSES,
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccLifecycleReadinessReadModel,
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { buildPccLifecycleReadinessViewModel } from './lifecycleReadinessAdapter.js';

const KNOWN_PROJECT_ID = 'fixture-project-001' as PccProjectId;

function makeEnvelope(
  data: PccLifecycleReadinessReadModel,
  sourceStatus: PccReadModelSourceStatus = 'available',
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccLifecycleReadinessReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
    ...(viewerPersona !== undefined ? { viewerPersona } : {}),
  };
}

const EMPTY_STATUS_COUNTS = Object.fromEntries(
  LIFECYCLE_READINESS_STATUSES.map((s) => [s, 0]),
) as PccLifecycleReadinessReadModel['summary']['statusCounts'];

const EMPTY_LIFECYCLE_DATA: PccLifecycleReadinessReadModel = {
  summary: {
    totalProjectItems: 0,
    statusCounts: EMPTY_STATUS_COUNTS,
    headlinePosture: 'unknown',
  },
  templateLibraryMetadata: LIFECYCLE_READINESS_LIBRARY_METADATA,
  sampleTemplateItems: [],
  sampleProjectItems: [],
  gates: [],
  domains: [],
  phases: [],
  evidenceSummary: [],
  blockerSummary: [],
};

describe('buildPccLifecycleReadinessViewModel — available envelope', () => {
  const vm = buildPccLifecycleReadinessViewModel(
    makeEnvelope(SAMPLE_LIFECYCLE_READINESS_READ_MODEL),
  );

  it('returns status="preview" with cardState="preview"', () => {
    expect(vm.status).toBe('preview');
    if (vm.status !== 'preview') return;
    expect(vm.cardState).toBe('preview');
    expect(vm.sourceStatus).toBe('available');
  });

  it('hero surfaces canonical library total and headline posture from summary', () => {
    if (vm.status !== 'preview') return;
    expect(vm.hero.headlinePosture).toBe(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.summary.headlinePosture,
    );
    expect(vm.hero.libraryTotal).toBe(157);
    expect(vm.hero.totalProjectItems).toBe(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.summary.totalProjectItems,
    );
    expect(vm.hero.totalOpenBlockers).toBeGreaterThan(0);
  });

  it('hero activeGate prefers blocked over at-risk over first', () => {
    if (vm.status !== 'preview') return;
    const blockedGate = SAMPLE_LIFECYCLE_READINESS_READ_MODEL.gates.find(
      (g) => g.posture === 'blocked',
    );
    expect(vm.hero.activeGate).toBe(blockedGate?.gateId);
    expect(vm.hero.activeGateLabel.length).toBeGreaterThan(0);
  });

  it('lifecycle map covers all 10 vocabulary phases (snapshot vs not-in-snapshot)', () => {
    if (vm.status !== 'preview') return;
    expect(vm.lifecycleMap.phases).toHaveLength(LIFECYCLE_READINESS_PHASES.length);
    const inSnapshot = vm.lifecycleMap.phases.filter((p) => p.isInSnapshot);
    expect(inSnapshot).toHaveLength(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.phases.length,
    );
    const notInSnapshot = vm.lifecycleMap.phases.filter((p) => !p.isInSnapshot);
    for (const p of notInSnapshot) {
      expect(p.posture).toBe('not-applicable');
      expect(p.openBlockerCount).toBe(0);
      expect(p.pendingEvidenceCount).toBe(0);
    }
  });

  it('family/domain region renders 3 family cards and one card per snapshot domain', () => {
    if (vm.status !== 'preview') return;
    expect(vm.familyDomains.families).toHaveLength(3);
    const startupCard = vm.familyDomains.families.find((f) => f.family === 'startup');
    const safetyCard = vm.familyDomains.families.find((f) => f.family === 'safety');
    const closeoutCard = vm.familyDomains.families.find((f) => f.family === 'closeout');
    expect(startupCard?.libraryCount).toBe(55);
    expect(safetyCard?.libraryCount).toBe(32);
    expect(closeoutCard?.libraryCount).toBe(70);
    expect(vm.familyDomains.domains).toHaveLength(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.domains.length,
    );
  });

  it('myActions returns active items across all owners when viewerPersona is absent', () => {
    if (vm.status !== 'preview') return;
    expect(vm.myActions.viewerPersona).toBeUndefined();
    expect(vm.myActions.items.length).toBeGreaterThan(0);
    for (const item of vm.myActions.items) {
      expect(['not-started', 'in-progress', 'needs-evidence', 'needs-review', 'returned', 'blocked', 'failed']).toContain(item.status);
    }
  });

  it('myActions filters to viewerPersona when provided', () => {
    const persona: PccPersona = 'project-manager';
    const filtered = buildPccLifecycleReadinessViewModel(
      makeEnvelope(SAMPLE_LIFECYCLE_READINESS_READ_MODEL, 'available', persona),
    );
    if (filtered.status !== 'preview') return;
    expect(filtered.myActions.viewerPersona).toBe(persona);
    for (const item of filtered.myActions.items) {
      expect(item.ownerPersona).toBe(persona);
    }
  });

  it('blockers expose blocker buckets with normalized severityCounts and active blocked items', () => {
    if (vm.status !== 'preview') return;
    expect(vm.blockers.buckets).toHaveLength(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.blockerSummary.length,
    );
    for (const b of vm.blockers.buckets) {
      expect(b.severityCounts).toMatchObject({
        critical: expect.any(Number),
        high: expect.any(Number),
        medium: expect.any(Number),
        low: expect.any(Number),
        informational: expect.any(Number),
      });
    }
    expect(vm.blockers.items.length).toBeGreaterThan(0);
    for (const item of vm.blockers.items) {
      expect(['open', 'escalated']).toContain(item.blockerState);
    }
    const escalated = vm.blockers.items.find(
      (i) => i.projectItemId === 'inst-safety-003',
    );
    expect(escalated).toBeDefined();
    expect(escalated?.severity).toBe('critical');
  });

  it('evidence buckets reflect every evidenceSummary entry verbatim', () => {
    if (vm.status !== 'preview') return;
    expect(vm.evidence.buckets).toHaveLength(
      SAMPLE_LIFECYCLE_READINESS_READ_MODEL.evidenceSummary.length,
    );
    for (const bucket of vm.evidence.buckets) {
      const raw = SAMPLE_LIFECYCLE_READINESS_READ_MODEL.evidenceSummary.find(
        (e) => e.evidenceState === bucket.evidenceState,
      );
      expect(raw).toBeDefined();
      expect(bucket.itemCount).toBe(raw!.itemIds.length);
      expect(bucket.documentControlSourceCount).toBe(raw!.documentControlSourceIds.length);
    }
  });

  it('future closeout exposure filters by itemType=future-closeout-exposure only', () => {
    if (vm.status !== 'preview') return;
    expect(vm.futureCloseout.items.length).toBeGreaterThan(0);
    const item = vm.futureCloseout.items.find(
      (i) => i.templateItemId === 'tpl-closeout-002',
    );
    expect(item).toBeDefined();
    expect(item?.hasProjectInstance).toBe(true);
    // Reference-only items must NOT appear here.
    expect(
      vm.futureCloseout.items.some((i) => i.templateItemId === 'tpl-closeout-003'),
    ).toBe(false);
  });

  it('source traceability surfaces 157/55/32/70 and three source documents', () => {
    if (vm.status !== 'preview') return;
    expect(vm.sourceTraceability.libraryTotal).toBe(157);
    const totals = Object.fromEntries(
      vm.sourceTraceability.familyTotals.map((f) => [f.family, f.count]),
    );
    expect(totals).toEqual({ startup: 55, safety: 32, closeout: 70 });
    expect(vm.sourceTraceability.sourceDocuments).toHaveLength(3);
  });
});

describe('buildPccLifecycleReadinessViewModel — degraded envelopes', () => {
  it('source-unavailable returns preview with cardState="unavailable-fixture" and safe-empty regions', () => {
    const vm = buildPccLifecycleReadinessViewModel(
      makeEnvelope(EMPTY_LIFECYCLE_DATA, 'source-unavailable'),
    );
    expect(vm.status).toBe('preview');
    if (vm.status !== 'preview') return;
    expect(vm.cardState).toBe('unavailable-fixture');
    expect(vm.sourceStatus).toBe('source-unavailable');
    expect(vm.lifecycleMap.phases.every((p) => !p.isInSnapshot)).toBe(true);
    expect(vm.familyDomains.domains).toHaveLength(0);
    expect(vm.myActions.items).toHaveLength(0);
    expect(vm.blockers.items).toHaveLength(0);
    expect(vm.evidence.buckets).toHaveLength(0);
    expect(vm.futureCloseout.items).toHaveLength(0);
    // Canonical 157/55/32/70 metadata preserved even in degraded mode.
    expect(vm.sourceTraceability.libraryTotal).toBe(157);
    expect(vm.hero.libraryTotal).toBe(157);
  });

  it('backend-unavailable returns preview with cardState="error" and library metadata still preserved', () => {
    const vm = buildPccLifecycleReadinessViewModel(
      makeEnvelope(EMPTY_LIFECYCLE_DATA, 'backend-unavailable'),
    );
    expect(vm.status).toBe('preview');
    if (vm.status !== 'preview') return;
    expect(vm.cardState).toBe('error');
    expect(vm.sourceStatus).toBe('backend-unavailable');
    expect(vm.sourceTraceability.libraryTotal).toBe(157);
    expect(vm.hero.activeGate).toBe('none');
    expect(vm.hero.activeGateLabel).toBe('No gate currently active');
  });
});

describe('buildPccLifecycleReadinessViewModel — region label maps', () => {
  const vm = buildPccLifecycleReadinessViewModel(
    makeEnvelope(SAMPLE_LIFECYCLE_READINESS_READ_MODEL),
  );

  it('every family card has a non-empty label', () => {
    if (vm.status !== 'preview') return;
    for (const f of vm.familyDomains.families) {
      expect(f.familyLabel.length).toBeGreaterThan(0);
    }
  });

  it('every domain card has a non-empty label (falls back to id when not in label map)', () => {
    if (vm.status !== 'preview') return;
    for (const d of vm.familyDomains.domains) {
      expect(d.domainLabel.length).toBeGreaterThan(0);
    }
  });

  it('every phase row has a non-empty label', () => {
    if (vm.status !== 'preview') return;
    for (const p of vm.lifecycleMap.phases) {
      expect(p.phaseLabel.length).toBeGreaterThan(0);
    }
  });
});

describe('buildPccLifecycleReadinessViewModel — item detail', () => {
  const vm = buildPccLifecycleReadinessViewModel(
    makeEnvelope(SAMPLE_LIFECYCLE_READINESS_READ_MODEL),
  );

  function findMyAction(projectItemId: string) {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const item = vm.myActions.items.find((i) => i.projectItemId === projectItemId);
    expect(item, `myActions item ${projectItemId}`).toBeDefined();
    return item!;
  }

  function findBlocker(projectItemId: string) {
    if (vm.status !== 'preview') throw new Error('expected preview');
    const item = vm.blockers.items.find((i) => i.projectItemId === projectItemId);
    expect(item, `blocker item ${projectItemId}`).toBeDefined();
    return item!;
  }

  it('attaches a record-backed detail to every list-bearing item', () => {
    if (vm.status !== 'preview') return;
    for (const i of vm.myActions.items) expect(i.detail).toBeDefined();
    for (const i of vm.blockers.items) expect(i.detail).toBeDefined();
    for (const i of vm.futureCloseout.items) expect(i.detail).toBeDefined();
  });

  it('detail surfaces full source traceability (file/page/section/itemKey/exact text)', () => {
    const item = findMyAction('inst-startup-001');
    expect(item.detail.sourceFile).toBe('Project_Startup_Checklist(2).pdf');
    expect(item.detail.sourcePage).toBeGreaterThan(0);
    expect(item.detail.sourceSection.length).toBeGreaterThan(0);
    expect(item.detail.sourceItemKey.length).toBeGreaterThan(0);
    expect(item.detail.exactItemText.length).toBeGreaterThan(0);
    expect(item.detail.sourceTraceabilityRequirement.length).toBeGreaterThan(0);
  });

  it('detail propagates project-instance fields when project item present', () => {
    const item = findMyAction('inst-startup-002');
    expect(item.detail.status).toBe('needs-evidence');
    expect(item.detail.posture).toBe('at-risk');
    expect(item.detail.exceptionCode).toBe('evidence-missing');
    expect(item.detail.evidenceState).toBeDefined();
  });

  it('detail leaves optional fields undefined when fixture omits them (no invented data)', () => {
    const item = findMyAction('inst-startup-001');
    expect(item.detail.completedAtUtc).toBeUndefined();
    expect(item.detail.recurrenceCadence).toBeUndefined();
    expect(item.detail.exceptionCode).toBeUndefined();
  });

  it('safety failed-state flag is true for inst-safety-003 and surfaces the exception code only (no compliance editorializing)', () => {
    const item = findBlocker('inst-safety-003');
    expect(item.detail.isSafetyFailedState).toBe(true);
    expect(item.detail.exceptionCode).toBe('failed-safety-check');
    // Adapter must not invent compliance words.
    const json = JSON.stringify(item.detail);
    expect(/compliant|non-compliant|violation/i.test(json)).toBe(false);
  });

  it('isCloseoutFromDayOne is true for tpl-closeout-001 (closeout family + activeByDefault)', () => {
    if (vm.status !== 'preview') return;
    // tpl-closeout-001 is in My Actions as inst-closeout-001 (status=blocked is active)
    const item = vm.myActions.items.find((i) => i.templateItemId === 'tpl-closeout-001');
    expect(item).toBeDefined();
    if (!item) return;
    expect(item.detail.activeByDefault).toBe(true);
    expect(item.detail.family).toBe('closeout');
    expect(item.detail.isCloseoutFromDayOne).toBe(true);
  });

  it('isFutureCloseoutExposure is true only for itemType=future-closeout-exposure', () => {
    if (vm.status !== 'preview') return;
    for (const fc of vm.futureCloseout.items) {
      expect(fc.detail.isFutureCloseoutExposure).toBe(true);
    }
    for (const a of vm.myActions.items) {
      if (a.detail.itemType !== 'future-closeout-exposure') {
        expect(a.detail.isFutureCloseoutExposure).toBe(false);
      }
    }
  });

  it('external references are exposed as text-only descriptors (referenceUrlText, never as live URLs)', () => {
    const item = findMyAction('inst-startup-002');
    expect(item.detail.externalReferences.length).toBeGreaterThanOrEqual(0);
    for (const ref of item.detail.externalReferences) {
      expect(ref.referenceLabel.length).toBeGreaterThan(0);
      // The optional `referenceUrlText` is a string when present;
      // surface contract says it must NEVER be rendered as <a href>.
      if (ref.referenceUrlText !== undefined) {
        expect(typeof ref.referenceUrlText).toBe('string');
      }
    }
  });
});

describe('buildPccLifecycleReadinessViewModel — per-region cardState propagation', () => {
  it('propagates `preview` cardState to every list-bearing region under available envelope', () => {
    const vm = buildPccLifecycleReadinessViewModel(
      makeEnvelope(SAMPLE_LIFECYCLE_READINESS_READ_MODEL),
    );
    if (vm.status !== 'preview') return;
    expect(vm.familyDomains.cardState).toBe('preview');
    expect(vm.myActions.cardState).toBe('preview');
    expect(vm.blockers.cardState).toBe('preview');
    expect(vm.evidence.cardState).toBe('preview');
    expect(vm.futureCloseout.cardState).toBe('preview');
  });

  it('propagates `unavailable-fixture` to every list-bearing region under source-unavailable envelope', () => {
    const vm = buildPccLifecycleReadinessViewModel(
      makeEnvelope(EMPTY_LIFECYCLE_DATA, 'source-unavailable'),
    );
    if (vm.status !== 'preview') return;
    expect(vm.familyDomains.cardState).toBe('unavailable-fixture');
    expect(vm.myActions.cardState).toBe('unavailable-fixture');
    expect(vm.blockers.cardState).toBe('unavailable-fixture');
    expect(vm.evidence.cardState).toBe('unavailable-fixture');
    expect(vm.futureCloseout.cardState).toBe('unavailable-fixture');
  });

  it('propagates `error` to every list-bearing region under backend-unavailable envelope', () => {
    const vm = buildPccLifecycleReadinessViewModel(
      makeEnvelope(EMPTY_LIFECYCLE_DATA, 'backend-unavailable'),
    );
    if (vm.status !== 'preview') return;
    expect(vm.familyDomains.cardState).toBe('error');
    expect(vm.myActions.cardState).toBe('error');
    expect(vm.blockers.cardState).toBe('error');
    expect(vm.evidence.cardState).toBe('error');
    expect(vm.futureCloseout.cardState).toBe('error');
  });
});
