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

  it('registers exactly the thirteen approved route handlers', () => {
    expect(registrations).toHaveLength(13);
    for (const expected of EXPECTED_ROUTES) {
      const reg = findRegistration(expected.name);
      expect(reg.config.route).toBe(expected.route);
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

      expect((provider as any)[expected.method]).toHaveBeenCalledWith('project-known');
      expect(response.status).toBe(200);
      expect(response.jsonBody).toEqual({ data: envelope });
    }
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
