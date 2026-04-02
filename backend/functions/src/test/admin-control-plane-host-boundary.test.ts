import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * P3-02: Admin Control Plane host boundary regression guard
 * and release-scope proof.
 *
 * Proves the dedicated Admin Control Plane composition root satisfies
 * the boundary requirements established by the Phase 3 host strategy.
 *
 * These tests read source files directly to enforce structural invariants
 * that must not regress. They also serve as the machine-checkable
 * release-scope proof for the admin-control-plane host manifest.
 */

const FUNCTIONS_SRC = resolve(import.meta.dirname, '..');
const ACP_HOST_DIR = resolve(FUNCTIONS_SRC, 'hosts/admin-control-plane');

// Route families that MUST be in the Admin Control Plane host (foundation)
const IN_SCOPE_ROUTES = [
  'health',
];

// Route families that MUST NOT be in the Admin Control Plane host
const OUT_OF_SCOPE_ROUTES = [
  // Project Setup domain
  'projectRequests',
  'provisioningSaga',
  'timerFullSpec',
  'signalr',
  'acknowledgments',
  'notifications',
  'cleanupIdempotency',
  // Domain CRUD
  'leads',
  'projects',
  'estimating',
  'schedule',
  'buyout',
  'compliance',
  'contracts',
  'risk',
  'scorecards',
  'pmp',
  // Stubs
  'proxy',
];

describe('P3-02 Admin Control Plane host boundary', () => {
  const hostIndex = readFileSync(resolve(ACP_HOST_DIR, 'index.ts'), 'utf-8');
  const hostFactory = readFileSync(resolve(ACP_HOST_DIR, 'service-factory.ts'), 'utf-8');

  describe('composition root imports only in-scope route families', () => {
    it.each(IN_SCOPE_ROUTES)(
      'imports %s route family',
      (route) => {
        expect(
          hostIndex,
          `Admin Control Plane host must import '${route}' route family`,
        ).toContain(`functions/${route}/index.js`);
      },
    );

    it('imports exactly 1 route family (foundation)', () => {
      const importCount = (hostIndex.match(/import\s+'/g) || []).length;
      expect(
        importCount,
        `Admin Control Plane host should import exactly 1 route family (foundation), found ${importCount}`,
      ).toBe(1);
    });
  });

  describe('composition root excludes out-of-scope route families', () => {
    it.each(OUT_OF_SCOPE_ROUTES)(
      'does NOT import %s route family',
      (route) => {
        expect(
          hostIndex,
          `Admin Control Plane host must NOT import '${route}' route family`,
        ).not.toContain(`functions/${route}/`);
      },
    );
  });

  describe('service factory excludes Project Setup and domain CRUD services', () => {
    const excludedServiceTypes = [
      'IProjectRequestsRepository',
      'IAcknowledgmentService',
      'ISignalRPushService',
      'ISharePointService',
      'INotificationService',
      'IIdempotencyStorageService',
      'ILeadService',
      'IProjectService',
      'IEstimatingService',
      'IScheduleService',
      'IBuyoutService',
      'IComplianceService',
      'IContractService',
      'IRiskService',
      'IScorecardService',
      'IPmpService',
    ];

    it.each(excludedServiceTypes)(
      'does NOT reference %s',
      (serviceType) => {
        expect(
          hostFactory,
          `Admin Control Plane service factory must NOT reference '${serviceType}'`,
        ).not.toContain(serviceType);
      },
    );
  });

  describe('host.json has tenant-specific CORS', () => {
    const hostJson = JSON.parse(
      readFileSync(resolve(ACP_HOST_DIR, 'host.json'), 'utf-8'),
    );

    it('allows the tenant origin', () => {
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      expect(origins).toContain('https://hedrickbrotherscom.sharepoint.com');
    });

    it('does NOT allow wildcard origins', () => {
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      const wildcards = origins.filter((o: string) => o.includes('*'));
      expect(wildcards).toEqual([]);
    });

    it('requires credentials', () => {
      expect(hostJson.extensions?.http?.cors?.supportCredentials).toBe(true);
    });

    it('has exactly one allowed origin', () => {
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      expect(origins.length).toBe(1);
    });
  });

  describe('config validation scoped to Admin Control Plane', () => {
    it('service factory uses validateAdminControlPlaneStartupConfig', () => {
      expect(hostFactory).toContain('validateAdminControlPlaneStartupConfig');
    });

    it('service factory does NOT call validateRequiredConfig', () => {
      expect(hostFactory).not.toContain('validateRequiredConfig');
    });

    it('service factory does NOT call validateProjectSetupStartupConfig', () => {
      expect(hostFactory).not.toContain('validateProjectSetupStartupConfig');
    });

    it('service factory does NOT call validateProvisioningPrerequisites', () => {
      expect(hostFactory).not.toContain('validateProvisioningPrerequisites');
    });
  });

  describe('auth posture is explicit and scoped', () => {
    it('service factory does not define its own auth logic', () => {
      expect(hostFactory).not.toContain('validateToken');
      expect(hostFactory).not.toContain('withAuth');
    });

    it('host.json does not define custom auth settings', () => {
      const hostJson = JSON.parse(
        readFileSync(resolve(ACP_HOST_DIR, 'host.json'), 'utf-8'),
      );
      expect(hostJson).not.toHaveProperty('auth');
    });
  });

  describe('shared code is imported, not duplicated', () => {
    it('service factory imports from shared services path', () => {
      expect(hostFactory).toContain("from '../../services/");
    });

    it('service factory imports shared utils', () => {
      expect(hostFactory).toContain("from '../../utils/validate-config.js'");
      expect(hostFactory).toContain("from '../../utils/adapter-mode-guard.js'");
    });

    it('composition root imports from shared functions path', () => {
      expect(hostIndex).toContain("'../../functions/");
    });
  });
});

/**
 * P3-03: Admin Control Plane service container foundation.
 *
 * Validates the expanded service container includes the required admin
 * domain service interfaces and that stub implementations are wired.
 */
describe('P3-03 Admin Control Plane service container foundation', () => {
  const hostFactory = readFileSync(resolve(ACP_HOST_DIR, 'service-factory.ts'), 'utf-8');

  describe('service container includes admin domain services', () => {
    const requiredAdminServices = [
      'IAdminRunService',
      'IAdminAdapterRegistry',
      'IAdminConfigService',
      'IAdminAuditService',
      'IAdminPreflightService',
      'IAdminActorContextResolver',
    ];

    it.each(requiredAdminServices)(
      'service factory references %s interface',
      (serviceType) => {
        expect(
          hostFactory,
          `Admin Control Plane service factory must reference '${serviceType}'`,
        ).toContain(serviceType);
      },
    );
  });

  describe('service container properties are present', () => {
    const requiredProperties = [
      'runService',
      'adapterRegistry',
      'configService',
      'auditService',
      'preflightService',
      'actorContextResolver',
    ];

    it.each(requiredProperties)(
      'container interface includes %s property',
      (prop) => {
        expect(
          hostFactory,
          `IAdminControlPlaneServiceContainer must include '${prop}' property`,
        ).toContain(prop);
      },
    );
  });

  describe('stub implementations are wired', () => {
    const requiredStubs = [
      'StubAdminRunService',
      'StubAdminAdapterRegistry',
      'StubAdminConfigService',
      'StubAdminAuditService',
      'StubAdminPreflightService',
      'StubAdminActorContextResolver',
    ];

    it.each(requiredStubs)(
      'factory instantiates %s',
      (stub) => {
        expect(
          hostFactory,
          `Admin Control Plane factory must instantiate '${stub}'`,
        ).toContain(stub);
      },
    );
  });

  describe('service interfaces are defined in admin-control-plane services', () => {
    it('types.ts exists', () => {
      expect(existsSync(resolve(FUNCTIONS_SRC, 'services/admin-control-plane/types.ts'))).toBe(true);
    });

    it('stubs.ts exists', () => {
      expect(existsSync(resolve(FUNCTIONS_SRC, 'services/admin-control-plane/stubs.ts'))).toBe(true);
    });

    it('index.ts barrel exists', () => {
      expect(existsSync(resolve(FUNCTIONS_SRC, 'services/admin-control-plane/index.ts'))).toBe(true);
    });
  });

  describe('factory imports from admin-control-plane services, not duplicating', () => {
    it('imports from services/admin-control-plane/', () => {
      expect(hostFactory).toContain("from '../../services/admin-control-plane/");
    });

    it('does not inline service interface definitions', () => {
      // The factory should import interfaces, not define them
      expect(hostFactory).not.toMatch(/export interface IAdminRunService/);
      expect(hostFactory).not.toMatch(/export interface IAdminAdapterRegistry/);
    });
  });
});

describe('P3-02 Regression guards and release-scope proof', () => {
  const hostIndex = readFileSync(resolve(ACP_HOST_DIR, 'index.ts'), 'utf-8');
  const hostFactory = readFileSync(resolve(ACP_HOST_DIR, 'service-factory.ts'), 'utf-8');

  describe('scope drift prevention', () => {
    it('composition root has no dynamic imports', () => {
      expect(hostIndex).not.toMatch(/import\s*\(/);
    });

    it('composition root has no require() calls', () => {
      expect(hostIndex).not.toContain('require(');
    });

    it('service factory does not re-export createServiceFactory', () => {
      expect(hostFactory).not.toContain('createServiceFactory');
    });

    it('service factory does not re-export createProjectSetupServiceFactory', () => {
      expect(hostFactory).not.toContain('createProjectSetupServiceFactory');
    });

    it('service factory has its own singleton', () => {
      expect(hostFactory).toContain('createAdminControlPlaneServiceFactory');
      expect(hostFactory).not.toMatch(/import.*createServiceFactory/);
      expect(hostFactory).not.toMatch(/import.*createProjectSetupServiceFactory/);
    });
  });

  describe('release-scope proof: architecture docs are consistent', () => {
    it('RELEASE-SCOPE.md exists in the admin-control-plane host directory', () => {
      expect(existsSync(resolve(ACP_HOST_DIR, 'RELEASE-SCOPE.md'))).toBe(true);
    });

    it('RELEASE-SCOPE.md lists all in-scope families', () => {
      const manifest = readFileSync(resolve(ACP_HOST_DIR, 'RELEASE-SCOPE.md'), 'utf-8');
      for (const route of IN_SCOPE_ROUTES) {
        expect(manifest).toContain(route);
      }
    });

    it('RELEASE-SCOPE.md lists all excluded families', () => {
      const manifest = readFileSync(resolve(ACP_HOST_DIR, 'RELEASE-SCOPE.md'), 'utf-8');
      for (const route of OUT_OF_SCOPE_ROUTES) {
        expect(manifest).toContain(route);
      }
    });
  });

  describe('release-scope proof: host.json mirrors required runtime config', () => {
    const acpHostJson = JSON.parse(
      readFileSync(resolve(ACP_HOST_DIR, 'host.json'), 'utf-8'),
    );

    it('has function timeout matching monolithic host', () => {
      const monoHostJson = JSON.parse(
        readFileSync(resolve(FUNCTIONS_SRC, '../host.json'), 'utf-8'),
      );
      expect(acpHostJson.functionTimeout).toBe(monoHostJson.functionTimeout);
    });

    it('has api route prefix', () => {
      expect(acpHostJson.extensions?.http?.routePrefix).toBe('api');
    });
  });

  describe('release-scope proof: monolithic host is unchanged', () => {
    it('monolithic index.ts still registers all 19 route families', () => {
      const monoIndex = readFileSync(resolve(FUNCTIONS_SRC, 'index.ts'), 'utf-8');
      const allFamilies = [
        ...IN_SCOPE_ROUTES,
        ...OUT_OF_SCOPE_ROUTES.filter(r => r !== 'proxy'),
      ];
      for (const route of allFamilies) {
        expect(
          monoIndex,
          `Monolithic host must still import '${route}'`,
        ).toContain(`functions/${route}/`);
      }
      expect(monoIndex).toContain('functions/proxy/');
    });
  });

  describe('release-scope proof: project-setup host is unchanged', () => {
    it('project-setup index.ts still registers exactly 8 route families', () => {
      const psIndex = readFileSync(
        resolve(FUNCTIONS_SRC, 'hosts/project-setup/index.ts'),
        'utf-8',
      );
      const importCount = (psIndex.match(/import\s+'/g) || []).length;
      expect(importCount).toBe(8);
    });
  });
});
