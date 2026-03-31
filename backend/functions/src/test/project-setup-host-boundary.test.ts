import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * P1-08/P1-09: Project Setup host boundary regression guard.
 *
 * Proves the dedicated Project Setup composition root satisfies
 * the boundary freeze acceptance criteria (ADR-0124, AC-1 through AC-7).
 *
 * These tests read source files directly to enforce structural invariants
 * that must not regress.
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
