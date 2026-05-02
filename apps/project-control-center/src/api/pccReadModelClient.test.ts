import { describe, it, expect, expectTypeOf } from 'vitest';
import type {
  PccDocumentControlReadModel,
  PccExternalLinksReadModel,
  PccLifecycleReadinessReadModel,
  PccPersona,
  PccPriorityActionsReadModel,
  PccProjectHomeReadModel,
  PccProjectId,
  PccProjectProfileReadModel,
  PccProjectReadinessFrameworkReadModel,
  PccReadModelEnvelope,
  PccSiteHealthReadModel,
  PccTeamAccessReadModel,
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

  it('enumerates exactly the ten backend route ids', () => {
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
    ]);
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
  it('is the union of the ten id literals', () => {
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
    ];
    expect(all.length).toBe(PCC_READ_MODEL_ROUTE_IDS.length);
  });
});
