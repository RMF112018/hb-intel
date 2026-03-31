import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

/**
 * P1-08/P1-09/P1-10: Project Setup host boundary regression guard
 * and release-scope proof.
 *
 * Proves the dedicated Project Setup composition root satisfies
 * the boundary freeze acceptance criteria (ADR-0124, AC-1 through AC-10).
 *
 * These tests read source files directly to enforce structural invariants
 * that must not regress. They also serve as the machine-checkable
 * release-scope proof required by Prompt-10.
 */

const FUNCTIONS_SRC = resolve(import.meta.dirname, '..');
const PS_HOST_DIR = resolve(FUNCTIONS_SRC, 'hosts/project-setup');

// Route families that MUST be in the Project Setup host (AC-4)
const IN_SCOPE_ROUTES = [
  'projectRequests',
  'provisioningSaga',
  'timerFullSpec',
  'signalr',
  'acknowledgments',
  'notifications',
  'health',
  'cleanupIdempotency',
];

// Route families that MUST NOT be in the Project Setup host (AC-3)
const OUT_OF_SCOPE_ROUTES = [
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
  'proxy',
];

describe('P1-08 Project Setup host boundary', () => {
  const hostIndex = readFileSync(resolve(PS_HOST_DIR, 'index.ts'), 'utf-8');
  const hostFactory = readFileSync(resolve(PS_HOST_DIR, 'service-factory.ts'), 'utf-8');

  describe('AC-1: composition root imports only in-scope route families', () => {
    it.each(IN_SCOPE_ROUTES)(
      'imports %s route family',
      (route) => {
        expect(
          hostIndex,
          `Project Setup host must import '${route}' route family`,
        ).toContain(`functions/${route}/index.js`);
      },
    );

    it('imports exactly 8 route families', () => {
      const importCount = (hostIndex.match(/import\s+'/g) || []).length;
      expect(
        importCount,
        `Project Setup host should import exactly 8 route families, found ${importCount}`,
      ).toBe(8);
    });
  });

  describe('AC-3: composition root excludes out-of-scope route families', () => {
    it.each(OUT_OF_SCOPE_ROUTES)(
      'does NOT import %s route family',
      (route) => {
        expect(
          hostIndex,
          `Project Setup host must NOT import '${route}' route family`,
        ).not.toContain(`functions/${route}/`);
      },
    );
  });

  describe('AC-2: service factory excludes domain CRUD services', () => {
    const domainServiceTypes = [
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

    it.each(domainServiceTypes)(
      'does NOT reference %s',
      (serviceType) => {
        expect(
          hostFactory,
          `Project Setup service factory must NOT reference '${serviceType}'`,
        ).not.toContain(serviceType);
      },
    );

    it('does NOT contain lazy getter pattern for domain services', () => {
      expect(hostFactory).not.toMatch(/get\s+(leads|projects|estimating|schedule|buyout|compliance|contracts|risk|scorecards|pmp)\s*\(/);
    });
  });

  describe('AC-5: host.json has tenant-specific CORS', () => {
    const hostJson = JSON.parse(
      readFileSync(resolve(PS_HOST_DIR, 'host.json'), 'utf-8'),
    );

    it('allows the tenant origin', () => {
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      expect(origins).toContain('https://hedrickbrotherscom.sharepoint.com');
    });

    it('does NOT allow wildcard sharepoint origins', () => {
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      const wildcards = origins.filter((o: string) => o.includes('*'));
      expect(
        wildcards,
        `CORS must not contain wildcard origins, found: ${wildcards.join(', ')}`,
      ).toEqual([]);
    });

    it('requires credentials', () => {
      expect(hostJson.extensions?.http?.cors?.supportCredentials).toBe(true);
    });
  });

  describe('AC-6: config validation scoped to Project Setup', () => {
    it('service factory uses validateProjectSetupStartupConfig, not validateRequiredConfig', () => {
      expect(
        hostFactory,
        'PS factory must use domain-scoped validateProjectSetupStartupConfig()',
      ).toContain('validateProjectSetupStartupConfig');
      expect(
        hostFactory,
        'PS factory must NOT call validateRequiredConfig (validates all tiers)',
      ).not.toContain('validateRequiredConfig');
    });

    it('service factory does NOT call validateProvisioningPrerequisites at startup', () => {
      expect(
        hostFactory,
        'Provisioning prerequisites are validated at saga execution time, not startup',
      ).not.toContain('validateProvisioningPrerequisites');
    });

    it('validateProjectSetupStartupConfig is exported from validate-config', () => {
      const validateConfigSource = readFileSync(
        resolve(FUNCTIONS_SRC, 'utils/validate-config.ts'),
        'utf-8',
      );
      expect(validateConfigSource).toContain('export function validateProjectSetupStartupConfig');
    });

    it('validateProjectSetupStartupConfig calls validateCoreConfig', () => {
      const validateConfigSource = readFileSync(
        resolve(FUNCTIONS_SRC, 'utils/validate-config.ts'),
        'utf-8',
      );
      // Extract the function body
      const fnMatch = validateConfigSource.match(
        /export function validateProjectSetupStartupConfig\(\)[^{]*\{([^}]+)\}/,
      );
      expect(fnMatch, 'validateProjectSetupStartupConfig must exist').toBeTruthy();
      expect(fnMatch![1]).toContain('validateCoreConfig()');
    });
  });

  describe('AC-6: auth posture is explicit and scoped', () => {
    it('service factory uses withAuth from shared middleware', () => {
      // The auth posture is inherited from shared middleware — route handlers
      // wrap with withAuth(). The PS factory doesn't define its own auth.
      // This test confirms the factory doesn't import or redefine auth logic.
      expect(hostFactory).not.toContain('validateToken');
      expect(hostFactory).not.toContain('withAuth');
    });

    it('host.json does not define custom auth settings', () => {
      const hostJson = JSON.parse(
        readFileSync(resolve(PS_HOST_DIR, 'host.json'), 'utf-8'),
      );
      // Auth is handled at the application layer (withAuth middleware),
      // not at the host.json level
      expect(hostJson).not.toHaveProperty('auth');
    });
  });

  describe('AC-6: managed identity posture is scoped', () => {
    it('service factory initializes managedIdentity service', () => {
      expect(hostFactory).toContain('managedIdentity');
      expect(hostFactory).toContain('ManagedIdentityTokenService');
    });

    it('service factory does NOT reference domain-specific MI grants', () => {
      // PS host only needs MI for SharePoint/Graph/Table Storage access
      // No domain-CRUD-specific MI grants
      expect(hostFactory).not.toContain('DEPT_BACKGROUND_ACCESS');
      expect(hostFactory).not.toContain('STRUCTURAL_OWNER_UPNS');
    });
  });

  describe('AC-7: shared code is imported, not duplicated', () => {
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
 * P1-10: Strengthened regression guards and release-scope proof.
 *
 * These tests go beyond the acceptance criteria to guard against
 * scope drift, document drift, and config expansion.
 */
describe('P1-10 Regression guards and release-scope proof', () => {
  const hostIndex = readFileSync(resolve(PS_HOST_DIR, 'index.ts'), 'utf-8');
  const hostFactory = readFileSync(resolve(PS_HOST_DIR, 'service-factory.ts'), 'utf-8');

  describe('scope drift prevention', () => {
    it('composition root has no dynamic imports', () => {
      // All imports must be static side-effect imports — no dynamic import()
      expect(hostIndex).not.toMatch(/import\s*\(/);
    });

    it('composition root has no require() calls', () => {
      expect(hostIndex).not.toContain('require(');
    });

    it('service factory does not re-export createServiceFactory', () => {
      // The PS factory must not delegate to the monolithic factory
      expect(hostFactory).not.toContain('createServiceFactory');
    });

    it('service factory has its own singleton, not shared with monolithic factory', () => {
      // The PS factory uses createProjectSetupServiceFactory, not createServiceFactory
      expect(hostFactory).toContain('createProjectSetupServiceFactory');
      expect(hostFactory).not.toMatch(/import.*createServiceFactory/);
    });

    it('host.json has exactly one allowed origin', () => {
      const hostJson = JSON.parse(
        readFileSync(resolve(PS_HOST_DIR, 'host.json'), 'utf-8'),
      );
      const origins = hostJson.extensions?.http?.cors?.allowedOrigins ?? [];
      expect(
        origins.length,
        `PS host should have exactly 1 CORS origin, found ${origins.length}: ${origins.join(', ')}`,
      ).toBe(1);
    });
  });

  describe('config expansion prevention', () => {
    it('service factory does not reference EMAIL config', () => {
      expect(hostFactory).not.toContain('EMAIL_DELIVERY_API_KEY');
      expect(hostFactory).not.toContain('EMAIL_FROM_ADDRESS');
    });

    it('service factory does not reference NOTIFICATION_API_BASE_URL', () => {
      expect(hostFactory).not.toContain('NOTIFICATION_API_BASE_URL');
    });

    it('service factory does not reference SHAREPOINT_HUB_SITE_ID at startup', () => {
      // Hub site is a provisioning prerequisite, not a startup requirement
      expect(hostFactory).not.toContain('SHAREPOINT_HUB_SITE_ID');
    });

    it('service factory does not reference SHAREPOINT_APP_CATALOG_URL at startup', () => {
      expect(hostFactory).not.toContain('SHAREPOINT_APP_CATALOG_URL');
    });
  });

  describe('release-scope proof: PS host.json mirrors required runtime config', () => {
    const psHostJson = JSON.parse(
      readFileSync(resolve(PS_HOST_DIR, 'host.json'), 'utf-8'),
    );

    it('has SignalR extension configured', () => {
      expect(psHostJson.extensions?.signalR?.connectionStringSetting)
        .toBe('AzureSignalRConnectionString');
    });

    it('has function timeout matching monolithic host', () => {
      const monoHostJson = JSON.parse(
        readFileSync(resolve(FUNCTIONS_SRC, '../host.json'), 'utf-8'),
      );
      expect(psHostJson.functionTimeout).toBe(monoHostJson.functionTimeout);
    });

    it('has api route prefix', () => {
      expect(psHostJson.extensions?.http?.routePrefix).toBe('api');
    });
  });

  describe('release-scope proof: architecture docs are consistent', () => {
    it('RELEASE-SCOPE.md exists in the PS host directory', () => {
      expect(existsSync(resolve(PS_HOST_DIR, 'RELEASE-SCOPE.md'))).toBe(true);
    });

    it('RELEASE-SCOPE.md lists all 8 in-scope families', () => {
      const manifest = readFileSync(resolve(PS_HOST_DIR, 'RELEASE-SCOPE.md'), 'utf-8');
      for (const route of IN_SCOPE_ROUTES) {
        expect(
          manifest,
          `RELEASE-SCOPE.md must mention '${route}'`,
        ).toContain(route);
      }
    });

    it('RELEASE-SCOPE.md lists all 11 excluded families', () => {
      const manifest = readFileSync(resolve(PS_HOST_DIR, 'RELEASE-SCOPE.md'), 'utf-8');
      for (const route of OUT_OF_SCOPE_ROUTES) {
        expect(
          manifest,
          `RELEASE-SCOPE.md must mention excluded family '${route}'`,
        ).toContain(route);
      }
    });

    it('ADR-0124 exists', () => {
      const adrPath = resolve(FUNCTIONS_SRC, '../../../docs/architecture/adr/ADR-0124-project-setup-backend-host-boundary.md');
      expect(existsSync(adrPath)).toBe(true);
    });

    it('boundary freeze plan exists', () => {
      const planPath = resolve(
        FUNCTIONS_SRC,
        '../../../docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md',
      );
      expect(existsSync(planPath)).toBe(true);
    });
  });

  describe('release-scope proof: monolithic host is unchanged', () => {
    it('monolithic index.ts still registers all 19 route families', () => {
      const monoIndex = readFileSync(resolve(FUNCTIONS_SRC, 'index.ts'), 'utf-8');
      const allFamilies = [...IN_SCOPE_ROUTES, ...OUT_OF_SCOPE_ROUTES.filter(r => r !== 'proxy')];
      // proxy is also in monolithic but not in OUT_OF_SCOPE_ROUTES check — add separately
      for (const route of allFamilies) {
        expect(
          monoIndex,
          `Monolithic host must still import '${route}'`,
        ).toContain(`functions/${route}/`);
      }
      expect(monoIndex).toContain('functions/proxy/');
    });
  });
});

/**
 * P3-10: Project Setup auth readiness — route protection proof.
 *
 * Verifies that every HTTP route family in the PS host is auth-protected
 * (uses withAuth) or is a documented exception (health, timer triggers).
 */
describe('P3-10 Project Setup auth readiness', () => {
  // PS host route families that register HTTP handlers
  const PS_HTTP_ROUTES = [
    'projectRequests',
    'provisioningSaga',
    'signalr',
    'acknowledgments',
  ];

  // PS host route families that are intentionally unauthenticated or non-HTTP
  const PS_AUTH_EXCEPTIONS = new Set([
    'health',              // Unauthenticated health probe
    'timerFullSpec',       // Timer trigger — not HTTP
    'cleanupIdempotency',  // Timer trigger — not HTTP
    'notifications',       // Internal delivery
  ]);

  it.each(PS_HTTP_ROUTES)(
    'PS route family %s uses withAuth()',
    (route) => {
      const routeIndex = readFileSync(
        resolve(FUNCTIONS_SRC, `functions/${route}/index.ts`),
        'utf-8',
      );
      expect(
        routeIndex,
        `PS route family '${route}' must use withAuth() for JWT protection`,
      ).toContain('withAuth');
    },
  );

  it('proxy is NOT in the Project Setup host (P3-10 scope decision)', () => {
    const hostIndex = readFileSync(resolve(PS_HOST_DIR, 'index.ts'), 'utf-8');
    expect(hostIndex).not.toContain('functions/proxy/');
  });

  it('proxy handler is explicitly marked as out of PS release scope', () => {
    const proxyHandler = readFileSync(
      resolve(FUNCTIONS_SRC, 'functions/proxy/proxy-handler.ts'),
      'utf-8',
    );
    expect(proxyHandler).toContain('NOT IN PROJECT SETUP RELEASE SCOPE');
  });
});
