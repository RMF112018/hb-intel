import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  LAUNCH_LINK_STATES,
  EXTERNAL_SYSTEM_REQUIRED_BEFORE,
  type ILaunchLink,
  type IExternalSystemMissingConfig,
} from './ExternalSystems.js';
import type { PccProjectStage } from './PccProjectEnums.js';

describe('PCC launch links', () => {
  it('LAUNCH_LINK_STATES locks the configured/missing pair', () => {
    expect([...LAUNCH_LINK_STATES]).toEqual(['configured', 'missing']);
  });

  it('EXTERNAL_SYSTEM_REQUIRED_BEFORE matches the locked literal set', () => {
    expect([...EXTERNAL_SYSTEM_REQUIRED_BEFORE]).toEqual([
      'preconstruction',
      'active_construction',
      'closeout',
      'always',
    ]);
  });

  it('the three stage-aligned required-before values are assignable to PccProjectStage', () => {
    expectTypeOf<'preconstruction'>().toMatchTypeOf<PccProjectStage>();
    expectTypeOf<'active_construction'>().toMatchTypeOf<PccProjectStage>();
    expectTypeOf<'closeout'>().toMatchTypeOf<PccProjectStage>();
  });

  it('configured branch requires a url', () => {
    const configured: ILaunchLink = {
      id: 'll-1',
      displayLabel: 'Open in Procore',
      systemId: 'procore',
      state: 'configured',
      url: 'https://example.invalid/procore/projects/123',
      opensInNewWindow: true,
    };
    expect(configured.state).toBe('configured');
    if (configured.state === 'configured') {
      expectTypeOf(configured.url).toEqualTypeOf<string>();
      expect(configured.url.length).toBeGreaterThan(0);
    }
  });

  it('missing branch forbids url and accepts an optional missingConfig', () => {
    const missingConfig: IExternalSystemMissingConfig = {
      systemId: 'procore',
      severity: 'Repair Required',
      requiredBefore: 'active_construction',
      message: 'Procore project mapping is required before active construction.',
      ownerPersona: 'pcc-admin',
    };
    const missing: ILaunchLink = {
      id: 'll-2',
      displayLabel: 'Open in Procore',
      systemId: 'procore',
      state: 'missing',
      opensInNewWindow: true,
      missingConfig,
    };
    expect(missing.state).toBe('missing');
    if (missing.state === 'missing') {
      // `url` is `?: never` on the missing branch — accessing via the
      // narrowed branch yields `undefined` only.
      expect((missing as { url?: undefined }).url).toBeUndefined();
      expect(missing.missingConfig?.requiredBefore).toBe('active_construction');
    }
  });

  it('IExternalSystemMissingConfig requiredBefore restricted to allowed literals', () => {
    for (const value of EXTERNAL_SYSTEM_REQUIRED_BEFORE) {
      const cfg: IExternalSystemMissingConfig = {
        systemId: 'procore',
        severity: 'Warning',
        requiredBefore: value,
        message: 'sample',
        ownerPersona: 'pcc-admin',
      };
      expect(EXTERNAL_SYSTEM_REQUIRED_BEFORE).toContain(cfg.requiredBefore);
    }
  });
});
