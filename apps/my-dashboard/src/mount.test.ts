import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { _resetConfig, setRuntimeConfig } from './config/runtimeConfig.js';
import { _resetWarnedConfigSignature, warnIfRuntimeConfigIncomplete } from './mount.js';

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  _resetConfig();
  _resetWarnedConfigSignature();
  vi.stubEnv('VITE_BACKEND_MODE', '');
  vi.stubEnv('VITE_FUNCTION_APP_URL', '');
  vi.stubEnv('VITE_API_AUDIENCE', '');
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  _resetConfig();
  _resetWarnedConfigSignature();
  vi.unstubAllEnvs();
  warnSpy.mockRestore();
});

describe('warnIfRuntimeConfigIncomplete — single-emission contract', () => {
  it('warns once with the comma-list of missing keys when production posture is fully unconfigured', () => {
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = warnSpy.mock.calls[0]?.[0] as string;
    expect(message).toContain('[HB-Intel] My Dashboard mounted in production mode');
    expect(message).toContain('Missing: function-app-url,api-audience,api-token-provider');
    expect(message).toContain('docs/maintenance/spfx-deployment-runbook.md');
  });

  it('does not warn in ui-review posture, even with no token provider', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when production posture is fully configured', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    warnIfRuntimeConfigIncomplete(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not contain any token, audience, or URL value in the warning text', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.secret.invalid',
      apiAudience: 'api://secret-audience',
    });
    warnIfRuntimeConfigIncomplete(false);
    const message = warnSpy.mock.calls[0]?.[0] as string;
    expect(message).not.toContain('hb-intel.secret.invalid');
    expect(message).not.toContain('secret-audience');
  });
});

describe('warnIfRuntimeConfigIncomplete — duplicate-mount guard', () => {
  it('does not re-warn on a second invocation with the same missing-keys posture', () => {
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    warnIfRuntimeConfigIncomplete(false);
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('re-warns once when the missing-keys posture changes (e.g. operator updates property pane)', () => {
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Posture change: operator supplies the URL via property pane mid-session.
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
    });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(2);
    const secondMessage = warnSpy.mock.calls[1]?.[0] as string;
    expect(secondMessage).toContain('Missing: api-audience,api-token-provider');

    // Re-warn-once: a third invocation with the SAME new posture stays silent.
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('does not warn when the posture transitions to fully healthy', () => {
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    warnIfRuntimeConfigIncomplete(true);
    // Healthy posture suppresses the warn; total stays at 1.
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('warns again after an unhealthy → healthy → unhealthy transition (regression posture)', () => {
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    warnIfRuntimeConfigIncomplete(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    // Operator clears the property pane; we re-enter the unhealthy posture.
    _resetConfig();
    setRuntimeConfig({ backendMode: 'production' });
    warnIfRuntimeConfigIncomplete(false);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});
