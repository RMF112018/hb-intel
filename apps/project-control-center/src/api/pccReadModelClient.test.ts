import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  IPccExternalObjectReferencesReadModel,
  IPccExternalReviewItemsReadModel,
  IPccExternalSystemAuditEventsReadModel,
  IPccExternalSystemHealthSnapshotsReadModel,
  IPccExternalSystemRegistryReadModel,
  IPccExternalSystemsLaunchPadReadModel,
  IPccHbiSourceLineageReadModel,
  IPccProjectExternalLaunchLinksReadModel,
  IPccProjectExternalSystemMappingsReadModel,
  PccApprovalsReadModel,
  PccBuyoutLogReadModel,
  PccConstraintsLogReadModel,
  PccCrossProjectKnowledgeReadModel,
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPermitInspectionControlCenterReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectLensesReadModel,
  PccProjectMemoryReadModel,
  PccProjectProfileReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccProjectTraceabilityReadModel,
  PccReadModelEnvelope,
  PccResponsibilityMatrixReadModel,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
  PccUnifiedLifecycleReadModel,
  PccUnifiedSearchAskHbiReadModel,
  PccWarrantyTraceReadModel,
  PccWorkCenterRegistryReadModel,
} from '@hbc/models/pcc';
import {
  PCC_READ_MODEL_NAMESPACE,
  PCC_READ_MODEL_ROUTE_IDS,
  PCC_READ_MODEL_ROUTE_PATHS,
  type IPccReadModelClient,
  type PccReadModelRouteId,
} from './pccReadModelClient.js';

describe('IPccReadModelClient route metadata', () => {
  it('exposes the literal namespace', () => {
    expect(PCC_READ_MODEL_NAMESPACE).toBe('pcc');
  });

  it('enumerates exactly the thirty-three backend route ids', () => {
    expect([...PCC_READ_MODEL_ROUTE_IDS]).toEqual([
      'profile',
      'modules',
      'home',
      'priority-actions',
      'document-control',
      'external-links',
      'site-health',
      'team-access',
      'project-readiness',
      'lifecycle-readiness',
      'permit-inspection-control-center',
      'responsibility-matrix',
      'constraints-log',
      'buyout-log',
      'procore-project-mapping',
      'procore-sync-health',
      'unified-lifecycle',
      'project-memory',
      'project-lenses',
      'project-traceability',
      'warranty-trace',
      'cross-project-knowledge',
      'unified-search',
      'approvals',
      'external-systems-launch-pad',
      'external-system-registry',
      'project-external-launch-links',
      'project-external-system-mappings',
      'external-object-references',
      'external-review-items',
      'external-system-health-snapshots',
      'external-system-audit-events',
      'hbi-source-lineage',
    ]);
  });

  it('orders buyout-log immediately after constraints-log', () => {
    const ids: readonly string[] = PCC_READ_MODEL_ROUTE_IDS;
    const buyoutLogIndex = ids.indexOf('buyout-log');
    expect(buyoutLogIndex).toBeGreaterThan(-1);
    expect(ids[buyoutLogIndex - 1]).toBe('constraints-log');
  });

  it('orders approvals immediately after unified-search (Wave 14 / Prompt 04 cascade)', () => {
    const ids: readonly string[] = PCC_READ_MODEL_ROUTE_IDS;
    const approvalsIndex = ids.indexOf('approvals');
    expect(approvalsIndex).toBeGreaterThan(-1);
    expect(ids[approvalsIndex - 1]).toBe('unified-search');
  });

  it('exposes the exact buyout-log route path template', () => {
    expect(PCC_READ_MODEL_ROUTE_PATHS['buyout-log']).toBe('pcc/projects/{projectId}/buyout-log');
  });

  it('exposes the exact approvals route path template', () => {
    expect(PCC_READ_MODEL_ROUTE_PATHS.approvals).toBe('pcc/projects/{projectId}/approvals');
  });

  it('orders external-systems-launch-pad immediately after approvals (Wave 15 / Prompt 04 cascade)', () => {
    const ids: readonly string[] = PCC_READ_MODEL_ROUTE_IDS;
    const launchPadIndex = ids.indexOf('external-systems-launch-pad');
    expect(launchPadIndex).toBeGreaterThan(-1);
    expect(ids[launchPadIndex - 1]).toBe('approvals');
  });

  it('exposes verbatim Wave 15 External Systems Launch Pad route path templates', () => {
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-systems-launch-pad']).toBe(
      'pcc/projects/{projectId}/external-systems-launch-pad',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-system-registry']).toBe(
      'pcc/projects/{projectId}/external-system-registry',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['project-external-launch-links']).toBe(
      'pcc/projects/{projectId}/project-external-launch-links',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['project-external-system-mappings']).toBe(
      'pcc/projects/{projectId}/project-external-system-mappings',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-object-references']).toBe(
      'pcc/projects/{projectId}/external-object-references',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-review-items']).toBe(
      'pcc/projects/{projectId}/external-review-items',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-system-health-snapshots']).toBe(
      'pcc/projects/{projectId}/external-system-health-snapshots',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-system-audit-events']).toBe(
      'pcc/projects/{projectId}/external-system-audit-events',
    );
    expect(PCC_READ_MODEL_ROUTE_PATHS['hbi-source-lineage']).toBe(
      'pcc/projects/{projectId}/hbi-source-lineage',
    );
  });

  it('preserves the legacy Wave 1 external-links route id and path verbatim', () => {
    expect([...PCC_READ_MODEL_ROUTE_IDS]).toContain('external-links');
    expect(PCC_READ_MODEL_ROUTE_PATHS['external-links']).toBe(
      'pcc/projects/{projectId}/external-links',
    );
  });

  // Wave 99 / Prompt 04A — guard against drift toward older non-canonical
  // route names. These are internal read-model substructures only and must
  // never appear as canonical route ids or templates.
  it('does not expose any non-canonical legacy route ids or paths', () => {
    const forbidden = ['lifecycle-timeline', 'traceability-graph', 'closed-project-references'];
    for (const id of PCC_READ_MODEL_ROUTE_IDS) {
      for (const f of forbidden) {
        expect(id).not.toBe(f);
      }
    }
    for (const path of Object.values(PCC_READ_MODEL_ROUTE_PATHS)) {
      for (const f of forbidden) {
        expect(path).not.toContain(f);
      }
    }
  });

  it('exposes a static route-path template for every route id', () => {
    for (const id of PCC_READ_MODEL_ROUTE_IDS) {
      const path = PCC_READ_MODEL_ROUTE_PATHS[id];
      expect(path.startsWith('pcc/projects/{projectId}/')).toBe(true);
      expect(path.endsWith(`/${id}`)).toBe(true);
    }
  });

  it('does not include base URL, scheme, or query string in route templates', () => {
    for (const id of PCC_READ_MODEL_ROUTE_IDS) {
      const path = PCC_READ_MODEL_ROUTE_PATHS[id];
      expect(path).not.toMatch(/^https?:\/\//);
      expect(path).not.toContain('?');
      expect(path).not.toContain('#');
    }
  });
});

describe('IPccReadModelClient interface symmetry', () => {
  it('returns the matching read-model envelope for each route id', () => {
    expectTypeOf<IPccReadModelClient['getProjectProfile']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectProfileReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getModuleRegistry']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccWorkCenterRegistryReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectHome']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectHomeReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getPriorityActions']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccPriorityActionsReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getDocumentControl']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccDocumentControlReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalLinks']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccExternalLinksReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getSiteHealth']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccSiteHealthReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getTeamAccess']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccTeamAccessReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectReadiness']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getLifecycleReadiness']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccLifecycleReadinessReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getPermitInspectionControlCenter']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccPermitInspectionControlCenterReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getResponsibilityMatrix']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccResponsibilityMatrixReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getConstraintsLog']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccConstraintsLogReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getBuyoutLog']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccBuyoutLogReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getUnifiedLifecycle']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectMemory']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectMemoryReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectLenses']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectLensesReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectTraceability']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccProjectTraceabilityReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getWarrantyTrace']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccWarrantyTraceReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getCrossProjectKnowledge']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccCrossProjectKnowledgeReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getUnifiedSearch']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccUnifiedSearchAskHbiReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getApprovals']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<PccApprovalsReadModel>>
    >();
    // Wave 15 / Prompt 04 — External Systems Launch Pad envelope returns.
    expectTypeOf<IPccReadModelClient['getExternalSystemsLaunchPad']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalSystemRegistry']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalSystemRegistryReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectExternalLaunchLinks']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccProjectExternalLaunchLinksReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getProjectExternalSystemMappings']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccProjectExternalSystemMappingsReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalObjectReferences']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalObjectReferencesReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalReviewItems']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalReviewItemsReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalSystemHealthSnapshots']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalSystemHealthSnapshotsReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getExternalSystemAuditEvents']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccExternalSystemAuditEventsReadModel>>
    >();
    expectTypeOf<IPccReadModelClient['getHbiSourceLineage']>().returns.toEqualTypeOf<
      Promise<PccReadModelEnvelope<IPccHbiSourceLineageReadModel>>
    >();
  });

  it('Wave 15 methods accept only [projectId, viewerPersona?] (no extra args)', () => {
    expectTypeOf<IPccReadModelClient['getExternalSystemsLaunchPad']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?]
    >();
    expectTypeOf<IPccReadModelClient['getHbiSourceLineage']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?]
    >();
    expectTypeOf<
      IPccReadModelClient['getProjectExternalSystemMappings']
    >().parameters.toEqualTypeOf<[PccProjectId, (PccPersona | undefined)?]>();
  });

  it('getApprovals accepts only [projectId, viewerPersona?] (no extra args)', () => {
    expectTypeOf<IPccReadModelClient['getApprovals']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?]
    >();
  });

  it('exposes optional query as the third positional arg on getUnifiedSearch only', () => {
    expectTypeOf<IPccReadModelClient['getUnifiedSearch']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?, (string | undefined)?]
    >();
  });

  it('accepts optional viewerPersona on every method', () => {
    expectTypeOf<IPccReadModelClient['getProjectProfile']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?]
    >();
    expectTypeOf<IPccReadModelClient['getProjectHome']>().parameters.toEqualTypeOf<
      [PccProjectId, (PccPersona | undefined)?]
    >();
  });
});

describe('PccReadModelRouteId', () => {
  it('is the union of the thirty-three id literals', () => {
    const all: PccReadModelRouteId[] = [
      'profile',
      'modules',
      'home',
      'priority-actions',
      'document-control',
      'external-links',
      'site-health',
      'team-access',
      'project-readiness',
      'lifecycle-readiness',
      'permit-inspection-control-center',
      'responsibility-matrix',
      'constraints-log',
      'buyout-log',
      'procore-project-mapping',
      'procore-sync-health',
      'unified-lifecycle',
      'project-memory',
      'project-lenses',
      'project-traceability',
      'warranty-trace',
      'cross-project-knowledge',
      'unified-search',
      'approvals',
      'external-systems-launch-pad',
      'external-system-registry',
      'project-external-launch-links',
      'project-external-system-mappings',
      'external-object-references',
      'external-review-items',
      'external-system-health-snapshots',
      'external-system-audit-events',
      'hbi-source-lineage',
    ];
    expect(all.length).toBe(PCC_READ_MODEL_ROUTE_IDS.length);
  });
});
