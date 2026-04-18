import { describe, expect, it } from 'vitest';
import {
  getLegacyFallbackDiscoveryConfig,
  getLegacyFallbackHostingConfig,
  LEGACY_FALLBACK_PILOT_APP_REGISTRATION,
  validateLegacyFallbackHostingConfig,
} from '../legacy-fallback/hosting-config.js';

function makeEnv(overrides: Record<string, string> = {}): (key: string) => string | undefined {
  const base: Record<string, string> = {
    HBC_LEGACY_FALLBACK_HOSTING_ENV: 'staging',
    HBC_LEGACY_FALLBACK_ENABLED: 'true',
    HBC_LEGACY_FALLBACK_FUNCTION_APP_NAME: 'func-hbintel-legacy-fallback-staging',
    HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL: 'https://func-hbintel-legacy-fallback-staging.azurewebsites.net',
    HBC_LEGACY_FALLBACK_HBCENTRAL_SITE_URL: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    SHAREPOINT_TENANT_URL: 'https://hedrickbrotherscom.sharepoint.com',
    AZURE_TENANT_ID: '0e834bd7-628b-42c8-b9ec-ecebc9719be4',
    AZURE_CLIENT_ID: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    HBC_LEGACY_FALLBACK_GRAPH_SCOPE: 'https://graph.microsoft.com/.default',
    HBC_LEGACY_FALLBACK_AUTH_POSTURE: 'pilot-interim',
    HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID: '08c399eb-a394-4087-b859-659d493f8dc7',
    ...overrides,
  };
  return (key: string) => base[key];
}

describe('legacy-fallback hosting config', () => {
  it('accepts a valid pilot interim configuration', () => {
    const result = validateLegacyFallbackHostingConfig(makeEnv());
    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('rejects invalid environment values', () => {
    const result = validateLegacyFallbackHostingConfig(
      makeEnv({ HBC_LEGACY_FALLBACK_HOSTING_ENV: 'qa' }),
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.key === 'HBC_LEGACY_FALLBACK_HOSTING_ENV')).toBe(true);
  });

  it('rejects non-pilot managed app id', () => {
    const result = validateLegacyFallbackHostingConfig(
      makeEnv({ HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID: '11111111-2222-3333-4444-555555555555' }),
    );
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.key === 'HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID')).toBe(true);
  });

  it('returns normalized config and parses optional booleans', () => {
    const config = getLegacyFallbackHostingConfig(makeEnv({ HBC_LEGACY_FALLBACK_ENABLED: 'false' }));
    expect(config.enabled).toBe(false);
    expect(config.authPosture).toBe('pilot-interim');
    expect(config.managedAppClientId).toBe('08c399eb-a394-4087-b859-659d493f8dc7');
  });

  it('throws for invalid required fields', () => {
    expect(() => getLegacyFallbackHostingConfig(makeEnv({ HBC_LEGACY_FALLBACK_FUNCTION_HOST_URL: 'not-url' }))).toThrow(
      /Legacy fallback hosting configuration invalid/i,
    );
  });

  it('exports pilot app registration metadata', () => {
    expect(LEGACY_FALLBACK_PILOT_APP_REGISTRATION.displayName).toBe('HB SharePoint Creator');
    expect(LEGACY_FALLBACK_PILOT_APP_REGISTRATION.appId).toBe('08c399eb-a394-4087-b859-659d493f8dc7');
    expect(LEGACY_FALLBACK_PILOT_APP_REGISTRATION.productionReady).toBe(false);
  });

  it('resolves discovery defaults when optional values are absent', () => {
    const discovery = getLegacyFallbackDiscoveryConfig(makeEnv());
    expect(discovery.enabled).toBe(true);
    expect(discovery.timerEnabled).toBe(false);
    expect(discovery.defaultYears).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    expect(discovery.maxFoldersPerRun).toBe(5000);
  });

  it('supports explicit discovery years and run limits', () => {
    const discovery = getLegacyFallbackDiscoveryConfig(makeEnv({
      HBC_LEGACY_FALLBACK_DISCOVERY_YEARS: '2024,2025',
      HBC_LEGACY_FALLBACK_DISCOVERY_MAX_FOLDERS_PER_RUN: '50',
      HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED: 'true',
    }));
    expect(discovery.defaultYears).toEqual([2024, 2025]);
    expect(discovery.maxFoldersPerRun).toBe(50);
    expect(discovery.timerEnabled).toBe(true);
  });
});
