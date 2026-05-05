import { beforeEach, describe, expect, it, vi } from 'vitest';

const registrations: Array<{ name: string; config: any }> = [];
const provider = {
  getProjectProfile: vi.fn(),
  getModuleRegistry: vi.fn(),
  getProjectHome: vi.fn(),
  getPriorityActions: vi.fn(),
  getDocumentControl: vi.fn(),
  getExternalLinks: vi.fn(),
  getSiteHealth: vi.fn(),
  getTeamAccess: vi.fn(),
  getProjectReadiness: vi.fn(),
  getLifecycleReadiness: vi.fn(),
  getPermitInspectionControlCenter: vi.fn(),
  getResponsibilityMatrix: vi.fn(),
  getConstraintsLog: vi.fn(),
  getBuyoutLog: vi.fn(),
  getProcoreProjectMapping: vi.fn(),
  getProcoreSyncHealth: vi.fn(),
  getUnifiedLifecycle: vi.fn(),
  getProjectMemory: vi.fn(),
  getProjectLenses: vi.fn(),
  getProjectTraceability: vi.fn(),
  getWarrantyTrace: vi.fn(),
  getCrossProjectKnowledge: vi.fn(),
  getUnifiedSearch: vi.fn(),
  getApprovals: vi.fn(),
  // Wave 15 / Prompt 03 — External Systems Launch Pad provider methods.
  getExternalSystemsLaunchPad: vi.fn(),
  getExternalSystemRegistry: vi.fn(),
  getProjectExternalLaunchLinks: vi.fn(),
  getProjectExternalSystemMappings: vi.fn(),
  getExternalObjectReferences: vi.fn(),
  getExternalReviewItems: vi.fn(),
  getExternalSystemHealthSnapshots: vi.fn(),
  getExternalSystemAuditEvents: vi.fn(),
  getHbiSourceLineage: vi.fn(),
};

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../middleware/request-id.js', () => ({
  extractOrGenerateRequestId: vi.fn(() => 'req-123'),
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => {
    const wrapped = vi.fn((request: any, context: any) =>
      handler(request, context, {
        userToken: 'token',
        claims: { oid: 'oid-1', upn: 'user@hbc.test', roles: [] },
      }),
    );
    (wrapped as any).__withAuth = true;
    return wrapped;
  },
}));

vi.mock('./read-models/pcc-mock-read-model-provider.js', () => ({
  PccMockReadModelProvider: vi.fn(() => provider),
}));

const EXPECTED_ROUTES: ReadonlyArray<{ name: string; route: string; method: string }> = [
  {
    name: 'getPccProjectProfile',
    route: 'pcc/projects/{projectId}/profile',
    method: 'getProjectProfile',
  },
  {
    name: 'getPccProjectModules',
    route: 'pcc/projects/{projectId}/modules',
    method: 'getModuleRegistry',
  },
  { name: 'getPccProjectHome', route: 'pcc/projects/{projectId}/home', method: 'getProjectHome' },
  {
    name: 'getPccProjectPriorityActions',
    route: 'pcc/projects/{projectId}/priority-actions',
    method: 'getPriorityActions',
  },
  {
    name: 'getPccProjectDocumentControl',
    route: 'pcc/projects/{projectId}/document-control',
    method: 'getDocumentControl',
  },
  {
    name: 'getPccProjectExternalLinks',
    route: 'pcc/projects/{projectId}/external-links',
    method: 'getExternalLinks',
  },
  {
    name: 'getPccProjectSiteHealth',
    route: 'pcc/projects/{projectId}/site-health',
    method: 'getSiteHealth',
  },
  {
    name: 'getPccProjectTeamAccess',
    route: 'pcc/projects/{projectId}/team-access',
    method: 'getTeamAccess',
  },
  {
    name: 'getPccProjectReadiness',
    route: 'pcc/projects/{projectId}/project-readiness',
    method: 'getProjectReadiness',
  },
  {
    name: 'getPccLifecycleReadiness',
    route: 'pcc/projects/{projectId}/lifecycle-readiness',
    method: 'getLifecycleReadiness',
  },
  {
    name: 'getPccPermitInspectionControlCenter',
    route: 'pcc/projects/{projectId}/permit-inspection-control-center',
    method: 'getPermitInspectionControlCenter',
  },
  {
    name: 'getPccProjectResponsibilityMatrix',
    route: 'pcc/projects/{projectId}/responsibility-matrix',
    method: 'getResponsibilityMatrix',
  },
  {
    name: 'getPccProjectConstraintsLog',
    route: 'pcc/projects/{projectId}/constraints-log',
    method: 'getConstraintsLog',
  },
  {
    name: 'getPccProjectBuyoutLog',
    route: 'pcc/projects/{projectId}/buyout-log',
    method: 'getBuyoutLog',
  },
  {
    name: 'getPccProcoreProjectMapping',
    route: 'pcc/projects/{projectId}/procore-project-mapping',
    method: 'getProcoreProjectMapping',
  },
  {
    name: 'getPccProcoreSyncHealth',
    route: 'pcc/projects/{projectId}/procore-sync-health',
    method: 'getProcoreSyncHealth',
  },
  {
    name: 'getPccUnifiedLifecycle',
    route: 'pcc/projects/{projectId}/unified-lifecycle',
    method: 'getUnifiedLifecycle',
  },
  {
    name: 'getPccProjectMemory',
    route: 'pcc/projects/{projectId}/project-memory',
    method: 'getProjectMemory',
  },
  {
    name: 'getPccProjectLenses',
    route: 'pcc/projects/{projectId}/project-lenses',
    method: 'getProjectLenses',
  },
  {
    name: 'getPccProjectTraceability',
    route: 'pcc/projects/{projectId}/project-traceability',
    method: 'getProjectTraceability',
  },
  {
    name: 'getPccWarrantyTrace',
    route: 'pcc/projects/{projectId}/warranty-trace',
    method: 'getWarrantyTrace',
  },
  {
    name: 'getPccCrossProjectKnowledge',
    route: 'pcc/projects/{projectId}/cross-project-knowledge',
    method: 'getCrossProjectKnowledge',
  },
  {
    name: 'getPccUnifiedSearch',
    route: 'pcc/projects/{projectId}/unified-search',
    method: 'getUnifiedSearch',
  },
  {
    name: 'getPccProjectApprovals',
    route: 'pcc/projects/{projectId}/approvals',
    method: 'getApprovals',
  },
  // Wave 15 / Prompt 03 — External Systems Launch Pad routes.
  {
    name: 'getPccExternalSystemsLaunchPad',
    route: 'pcc/projects/{projectId}/external-systems-launch-pad',
    method: 'getExternalSystemsLaunchPad',
  },
  {
    name: 'getPccExternalSystemRegistry',
    route: 'pcc/projects/{projectId}/external-system-registry',
    method: 'getExternalSystemRegistry',
  },
  {
    name: 'getPccProjectExternalLaunchLinks',
    route: 'pcc/projects/{projectId}/project-external-launch-links',
    method: 'getProjectExternalLaunchLinks',
  },
  {
    name: 'getPccProjectExternalSystemMappings',
    route: 'pcc/projects/{projectId}/project-external-system-mappings',
    method: 'getProjectExternalSystemMappings',
  },
  {
    name: 'getPccExternalObjectReferences',
    route: 'pcc/projects/{projectId}/external-object-references',
    method: 'getExternalObjectReferences',
  },
  {
    name: 'getPccExternalReviewItems',
    route: 'pcc/projects/{projectId}/external-review-items',
    method: 'getExternalReviewItems',
  },
  {
    name: 'getPccExternalSystemHealthSnapshots',
    route: 'pcc/projects/{projectId}/external-system-health-snapshots',
    method: 'getExternalSystemHealthSnapshots',
  },
  {
    name: 'getPccExternalSystemAuditEvents',
    route: 'pcc/projects/{projectId}/external-system-audit-events',
    method: 'getExternalSystemAuditEvents',
  },
  {
    name: 'getPccHbiSourceLineage',
    route: 'pcc/projects/{projectId}/hbi-source-lineage',
    method: 'getHbiSourceLineage',
  },
];

function findRegistration(name: string): { name: string; config: any } {
  const found = registrations.find((reg) => reg.name === name);
  if (!found) {
    throw new Error(`Missing route registration: ${name}`);
  }
  return found;
}

describe('PCC read-only route registrations', () => {
  beforeEach(async () => {
    registrations.length = 0;
    for (const spy of Object.values(provider)) {
      spy.mockReset();
    }
    vi.resetModules();
    await import('./pcc-read-model-routes.js');
  });

  it('registers exactly the canonical route handlers', () => {
    expect(registrations).toHaveLength(33);
    for (const expected of EXPECTED_ROUTES) {
      const reg = findRegistration(expected.name);
      expect(reg.config.route).toBe(expected.route);
    }
  });

  it('preserves the Wave 1 external-links route delegating to getExternalLinks', () => {
    const wave1Path = 'pcc/projects/{projectId}/external-links';
    const wave1Registrations = registrations.filter((reg) => reg.config.route === wave1Path);
    expect(wave1Registrations).toHaveLength(1);
    const wave1 = wave1Registrations[0]!;
    expect(wave1.name).toBe('getPccProjectExternalLinks');
    expect(wave1.config.methods).toEqual(['GET']);
  });

  it('exposes the Wave 15 External Systems Launch Pad routes as single GET-only registrations', () => {
    const wave15Paths = [
      'pcc/projects/{projectId}/external-systems-launch-pad',
      'pcc/projects/{projectId}/external-system-registry',
      'pcc/projects/{projectId}/project-external-launch-links',
      'pcc/projects/{projectId}/project-external-system-mappings',
      'pcc/projects/{projectId}/external-object-references',
      'pcc/projects/{projectId}/external-review-items',
      'pcc/projects/{projectId}/external-system-health-snapshots',
      'pcc/projects/{projectId}/external-system-audit-events',
      'pcc/projects/{projectId}/hbi-source-lineage',
    ] as const;
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const path of wave15Paths) {
      const matches = registrations.filter((reg) => reg.config.route === path);
      expect(matches, `route registered exactly once: ${path}`).toHaveLength(1);
      expect(matches[0]!.config.methods).toEqual(['GET']);
      for (const method of writeMethods) {
        const writeReg = registrations.find(
          (reg) =>
            reg.config.route === path &&
            Array.isArray(reg.config.methods) &&
            reg.config.methods.includes(method),
        );
        expect(writeReg, `no write registration for ${method} ${path}`).toBeUndefined();
      }
    }
  });

  it('exposes the Wave 13 procore data layer paths as single GET-only registrations', () => {
    const wave13DPaths = [
      'pcc/projects/{projectId}/procore-project-mapping',
      'pcc/projects/{projectId}/procore-sync-health',
    ] as const;
    for (const path of wave13DPaths) {
      const matches = registrations.filter((reg) => reg.config.route === path);
      expect(matches).toHaveLength(1);
      expect(matches[0]!.config.methods).toEqual(['GET']);

      const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
      for (const method of writeMethods) {
        const writeRegistration = registrations.find(
          (reg) =>
            reg.config.route === path &&
            Array.isArray(reg.config.methods) &&
            reg.config.methods.includes(method),
        );
        expect(writeRegistration).toBeUndefined();
      }
    }
  });

  it('exposes the Wave 11 responsibility-matrix path as a single GET-only registration', () => {
    const wave11Path = 'pcc/projects/{projectId}/responsibility-matrix';
    const wave11Registrations = registrations.filter((reg) => reg.config.route === wave11Path);

    expect(wave11Registrations).toHaveLength(1);

    const wave11 = wave11Registrations[0]!;
    expect(wave11.name).toBe('getPccProjectResponsibilityMatrix');
    expect(wave11.config.methods).toEqual(['GET']);

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of writeMethods) {
      const writeRegistration = registrations.find(
        (reg) =>
          reg.config.route === wave11Path &&
          Array.isArray(reg.config.methods) &&
          reg.config.methods.includes(method),
      );
      expect(writeRegistration).toBeUndefined();
    }
  });

  it('registers each route as GET-only and no write methods', () => {
    for (const reg of registrations) {
      expect(reg.config.methods).toEqual(['GET']);
      expect(reg.config.methods).not.toContain('POST');
      expect(reg.config.methods).not.toContain('PUT');
      expect(reg.config.methods).not.toContain('PATCH');
      expect(reg.config.methods).not.toContain('DELETE');
    }
  });

  it('exposes the Wave 10 permit-inspection-control-center path as a single GET-only registration', () => {
    const wave10Path = 'pcc/projects/{projectId}/permit-inspection-control-center';
    const wave10Registrations = registrations.filter((reg) => reg.config.route === wave10Path);

    expect(wave10Registrations).toHaveLength(1);

    const wave10 = wave10Registrations[0]!;
    expect(wave10.name).toBe('getPccPermitInspectionControlCenter');
    expect(wave10.config.methods).toEqual(['GET']);

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of writeMethods) {
      const writeRegistration = registrations.find(
        (reg) =>
          reg.config.route === wave10Path &&
          Array.isArray(reg.config.methods) &&
          reg.config.methods.includes(method),
      );
      expect(writeRegistration).toBeUndefined();
    }
  });

  it('exposes the Wave 12 constraints-log path as a single GET-only registration', () => {
    const wave12Path = 'pcc/projects/{projectId}/constraints-log';
    const wave12Registrations = registrations.filter((reg) => reg.config.route === wave12Path);

    expect(wave12Registrations).toHaveLength(1);

    const wave12 = wave12Registrations[0]!;
    expect(wave12.name).toBe('getPccProjectConstraintsLog');
    expect(wave12.config.methods).toEqual(['GET']);

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of writeMethods) {
      const writeRegistration = registrations.find(
        (reg) =>
          reg.config.route === wave12Path &&
          Array.isArray(reg.config.methods) &&
          reg.config.methods.includes(method),
      );
      expect(writeRegistration).toBeUndefined();
    }
  });

  it('exposes the Wave 13 buyout-log path as a single GET-only registration', () => {
    const wave13Path = 'pcc/projects/{projectId}/buyout-log';
    const wave13Registrations = registrations.filter((reg) => reg.config.route === wave13Path);

    expect(wave13Registrations).toHaveLength(1);

    const wave13 = wave13Registrations[0]!;
    expect(wave13.name).toBe('getPccProjectBuyoutLog');
    expect(wave13.config.methods).toEqual(['GET']);

    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of writeMethods) {
      const writeRegistration = registrations.find(
        (reg) =>
          reg.config.route === wave13Path &&
          Array.isArray(reg.config.methods) &&
          reg.config.methods.includes(method),
      );
      expect(writeRegistration).toBeUndefined();
    }
  });

  it('does not register any POST/PUT/PATCH/DELETE route whose path contains buyout-log', () => {
    const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
    const buyoutLogWriteRegistrations = registrations.filter(
      (reg) =>
        typeof reg.config.route === 'string' &&
        reg.config.route.includes('buyout-log') &&
        Array.isArray(reg.config.methods) &&
        reg.config.methods.some((m: string) =>
          writeMethods.includes(m as (typeof writeMethods)[number]),
        ),
    );
    expect(buyoutLogWriteRegistrations).toEqual([]);
  });

  it('exposes canonical unified lifecycle route IDs and does not register non-canonical aliases', () => {
    const canonical = [
      'pcc/projects/{projectId}/unified-lifecycle',
      'pcc/projects/{projectId}/project-memory',
      'pcc/projects/{projectId}/project-lenses',
      'pcc/projects/{projectId}/project-traceability',
      'pcc/projects/{projectId}/warranty-trace',
      'pcc/projects/{projectId}/cross-project-knowledge',
      'pcc/projects/{projectId}/unified-search',
    ];
    for (const route of canonical) {
      expect(registrations.some((reg) => reg.config.route === route)).toBe(true);
    }

    const forbidden = [
      'pcc/projects/{projectId}/lifecycle-timeline',
      'pcc/projects/{projectId}/traceability-graph',
      'pcc/projects/{projectId}/closed-project-references',
    ];
    for (const route of forbidden) {
      expect(registrations.some((reg) => reg.config.route === route)).toBe(false);
    }
  });

  it('applies withAuth posture to each route handler', () => {
    for (const reg of registrations) {
      expect((reg.config.handler as any).__withAuth).toBe(true);
      expect(reg.config.authLevel).toBe('anonymous');
    }
  });

  it('calls mapped provider method and returns { data: envelope } shape', async () => {
    for (const expected of EXPECTED_ROUTES) {
      const reg = findRegistration(expected.name);
      const envelope = {
        projectId: 'project-known',
        sourceStatus: 'available',
        generatedAt: '2026-04-30T00:00:00.000Z',
      };
      (provider as any)[expected.method].mockResolvedValueOnce(envelope);

      const response = await reg.config.handler(
        {
          params: { projectId: 'project-known' },
          headers: new Headers({ 'X-Request-Id': 'req-in' }),
        },
        {},
      );

      if (expected.method === 'getUnifiedSearch') {
        expect((provider as any)[expected.method]).toHaveBeenCalledWith(
          'project-known',
          undefined,
          undefined,
        );
      } else {
        expect((provider as any)[expected.method]).toHaveBeenCalledWith('project-known');
      }
      expect(response.status).toBe(200);
      expect(response.jsonBody).toEqual({ data: envelope });
    }
  });

  it('passes optional q parameter to unified-search provider method', async () => {
    const reg = findRegistration('getPccUnifiedSearch');
    const envelope = {
      projectId: 'project-known',
      sourceStatus: 'available',
      generatedAt: '2026-04-30T00:00:00.000Z',
    };
    provider.getUnifiedSearch.mockResolvedValueOnce(envelope);

    const response = await reg.config.handler(
      {
        params: { projectId: 'project-known' },
        query: new URLSearchParams('q=warranty%20product'),
        headers: new Headers(),
      },
      {},
    );

    expect(provider.getUnifiedSearch).toHaveBeenCalledWith(
      'project-known',
      undefined,
      'warranty product',
    );
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: envelope });
  });

  it('returns provider source-unavailable envelope for unknown projectId', async () => {
    const reg = findRegistration('getPccProjectProfile');
    const unknownEnvelope = {
      projectId: 'unknown-project',
      sourceStatus: 'source-unavailable',
      warnings: [{ code: 'source-unavailable' }],
    };
    provider.getProjectProfile.mockResolvedValueOnce(unknownEnvelope);

    const response = await reg.config.handler(
      {
        params: { projectId: 'unknown-project' },
        headers: new Headers(),
      },
      {},
    );

    expect(provider.getProjectProfile).toHaveBeenCalledWith('unknown-project');
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({ data: unknownEnvelope });
  });

  it('returns repo-consistent validation error when projectId is missing', async () => {
    const reg = findRegistration('getPccProjectProfile');

    const response = await reg.config.handler(
      {
        params: {},
        headers: new Headers(),
      },
      {},
    );

    expect(provider.getProjectProfile).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'projectId is required',
      requestId: 'req-123',
    });
  });
});
