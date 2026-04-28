import { describe, it, expect } from 'vitest';
import {
  SITE_HEALTH_SEVERITIES,
  REPAIR_TIERS,
  type ISiteHealthCheck,
  type IDriftIndicator,
  type ISiteHealthSummary,
  type SiteHealthCheckState,
} from './SiteHealth.js';
import type { PccSiteUrl } from './types.js';

const siteUrl = 'https://example.invalid/sites/abc' as PccSiteUrl;

describe('PCC Site Health types', () => {
  it('SITE_HEALTH_SEVERITIES matches the contract §19.3 values exactly', () => {
    expect([...SITE_HEALTH_SEVERITIES]).toEqual([
      'Info',
      'Warning',
      'Blocking',
      'Security Risk',
      'Repair Required',
    ]);
  });

  it('REPAIR_TIERS matches the contract §19A tier set', () => {
    expect([...REPAIR_TIERS]).toEqual(['T1', 'T2', 'T3', 'T4']);
  });

  it('ISiteHealthCheck state and repair tier literals are constrained', () => {
    const allowedStates: SiteHealthCheckState[] = ['pass', 'fail', 'warning', 'not-run'];
    for (const state of allowedStates) {
      const check: ISiteHealthCheck = {
        id: `c-${state}`,
        title: `sample ${state}`,
        state,
        severity: 'Warning',
        repairAvailable: false,
      };
      expect(allowedStates).toContain(check.state);
    }
    const tiered: ISiteHealthCheck = {
      id: 'c-tier',
      title: 'tiered',
      state: 'fail',
      severity: 'Repair Required',
      repairAvailable: true,
      repairTier: 'T2',
    };
    expect(REPAIR_TIERS).toContain(tiered.repairTier);
  });

  it('IDriftIndicator key is free-form string with severity from the locked set', () => {
    const drift: IDriftIndicator = {
      key: 'permission-inheritance:02_Contracts_and_Compliance',
      expected: 'inherited',
      actual: 'broken',
      severity: 'Security Risk',
      detail: 'inheritance break detected on sensitive library',
    };
    expect(drift.key.length).toBeGreaterThan(0);
    expect(SITE_HEALTH_SEVERITIES).toContain(drift.severity);
  });

  it('Prompt 02 minimal ISiteHealthSummary shape still typechecks', () => {
    const minimal: ISiteHealthSummary = {
      siteUrl,
      overallSeverity: 'Info',
      failingChecks: 0,
      warningChecks: 0,
      repairAvailable: false,
    };
    expect(minimal.siteUrl).toBe(siteUrl);
    expect(minimal.checks).toBeUndefined();
  });

  it('extended ISiteHealthSummary accepts projectId, checks, drift, and repair-request flag', () => {
    const summary: ISiteHealthSummary = {
      siteUrl,
      lastRunUtc: '2026-04-28T12:00:00Z',
      overallSeverity: 'Warning',
      failingChecks: 1,
      warningChecks: 2,
      repairAvailable: true,
      repairRequestAvailable: true,
      checks: [
        {
          id: 'sh-1',
          title: 'Procore mapping resolves',
          state: 'pass',
          severity: 'Info',
          repairAvailable: false,
        },
      ],
      driftIndicators: [
        {
          key: 'integration:procore.sync-health',
          severity: 'Warning',
        },
      ],
    };
    expect(summary.checks).toHaveLength(1);
    expect(summary.driftIndicators).toHaveLength(1);
  });
});
