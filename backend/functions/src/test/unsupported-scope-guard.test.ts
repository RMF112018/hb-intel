import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * P5-02: Unsupported/orphaned scope regression guard.
 *
 * Ensures that co-deployed domain services remain lazy-initialized (P4-02)
 * and that no new eagerly-initialized services are added without review.
 * Also verifies the proxy stub is clearly marked and no new unsupported
 * routes are introduced.
 *
 * Closes P5-01 gap: unsupported scope cannot quietly re-enter the package.
 */

const FUNCTIONS_SRC = resolve(import.meta.dirname, '..');

describe('P5-02 Unsupported scope regression guard', () => {
  it('service factory uses lazy getters for domain CRUD services', () => {
    const factorySource = readFileSync(
      resolve(FUNCTIONS_SRC, 'services/service-factory.ts'),
      'utf-8',
    );

    // Domain services that must be lazy (getter-based, not eagerly constructed)
    const lazyDomains = [
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
    ];

    for (const domain of lazyDomains) {
      expect(
        factorySource.includes(`get ${domain}()`),
        `Service '${domain}' must be a lazy getter in service-factory.ts`,
      ).toBe(true);
    }
  });

  it('service factory does NOT eagerly initialize domain CRUD services', () => {
    const factorySource = readFileSync(
      resolve(FUNCTIONS_SRC, 'services/service-factory.ts'),
      'utf-8',
    );

    // These patterns would indicate eager initialization
    const eagerPatterns = [
      /^\s+leads:\s+isMock\s+\?/m,
      /^\s+projects:\s+isMock\s+\?/m,
      /^\s+schedule:\s+isMock\s+\?/m,
      /^\s+buyout:\s+isMock\s+\?/m,
    ];

    for (const pattern of eagerPatterns) {
      expect(
        pattern.test(factorySource),
        `Found eager initialization pattern for a domain service — must use lazy getter`,
      ).toBe(false);
    }
  });

  it('Redis cache is NOT in the service container', () => {
    const factorySource = readFileSync(
      resolve(FUNCTIONS_SRC, 'services/service-factory.ts'),
      'utf-8',
    );

    expect(factorySource).not.toContain('redisCache');
    expect(factorySource).not.toContain('IRedisCacheService');
  });

  it('proxy handler is clearly marked as stub', () => {
    const proxySource = readFileSync(
      resolve(FUNCTIONS_SRC, 'functions/proxy/proxy-handler.ts'),
      'utf-8',
    );

    expect(proxySource).toContain('STUB');
    expect(proxySource).toContain('_mock');
  });

  it('no new function registration files exist without documentation', () => {
    // Track the expected function directories — any new ones should be reviewed
    const expectedDomains = new Set([
      'acknowledgments',
      'adminApi',
      'buyout',
      'cleanupIdempotency',
      'compliance',
      'contracts',
      'estimating',
      'health',
      'leads',
      'notifications',
      'pmp',
      'projectRequests',
      'projects',
      'provisioningSaga',
      'proxy',
      'risk',
      'safetyFieldExcellenceWeeklyRollup',
      'schedule',
      'scorecards',
      'signalr',
      'timerFullSpec',
      'legacyFallbackDiscovery',
      'myProjectsProjectionWebhook',
      'myProjectsProjectionSubscriptionRenewal',
      'myProjectsProjectionSubscriptionAdmin',
    ]);

    const functionsDir = resolve(FUNCTIONS_SRC, 'functions');
    const functionDirs = readdirSync(functionsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(resolve(functionsDir, d.name, 'index.ts')))
      .map((d) => d.name);

    const unexpected = functionDirs.filter((d) => !expectedDomains.has(d));
    expect(
      unexpected,
      `Unexpected function directory(ies): ${unexpected.join(', ')}. Review and add to expectedDomains set.`,
    ).toEqual([]);
  });
});
