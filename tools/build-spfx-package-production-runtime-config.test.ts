import { describe, expect, it } from 'vitest';
import {
  DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG,
  assertProductionRuntimeConfigRequirements,
  isProductionIntendedBackendMode,
} from './build-spfx-package-production-runtime-config';

describe('DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG', () => {
  it('includes my-dashboard', () => {
    expect(DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG.has('my-dashboard')).toBe(true);
  });

  it('does not include project-control-center (extension is a single-line change)', () => {
    expect(DOMAINS_REQUIRING_PRODUCTION_RUNTIME_CONFIG.has('project-control-center')).toBe(false);
  });
});

describe('isProductionIntendedBackendMode', () => {
  it('treats empty string as production-intended (falls through to runtime default)', () => {
    expect(isProductionIntendedBackendMode('')).toBe(true);
  });

  it('treats undefined as production-intended', () => {
    expect(isProductionIntendedBackendMode(undefined)).toBe(true);
  });

  it('treats explicit "production" as production-intended', () => {
    expect(isProductionIntendedBackendMode('production')).toBe(true);
  });

  it('treats explicit "ui-review" as the non-production opt-out', () => {
    expect(isProductionIntendedBackendMode('ui-review')).toBe(false);
  });

  it('is case-sensitive — uppercase "PRODUCTION" is not the production-intended case (matches resolveDefaultBackendMode pass-through)', () => {
    expect(isProductionIntendedBackendMode('PRODUCTION')).toBe(false);
  });
});

describe('assertProductionRuntimeConfigRequirements', () => {
  it('throws and names FUNCTION_APP_URL when missing for production my-dashboard', () => {
    expect(() =>
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: 'production',
        functionAppUrl: '',
        apiAudience: 'api://contoso',
      }),
    ).toThrow(/FUNCTION_APP_URL/);
  });

  it('throws and names API_AUDIENCE when missing for production my-dashboard', () => {
    expect(() =>
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: 'production',
        functionAppUrl: 'https://contoso-func.azurewebsites.net',
        apiAudience: '',
      }),
    ).toThrow(/API_AUDIENCE/);
  });

  it('throws and names both env vars when empty BACKEND_MODE leaves my-dashboard production-intended', () => {
    let err: Error | undefined;
    try {
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: '',
        functionAppUrl: '',
        apiAudience: '',
      });
    } catch (caught) {
      err = caught as Error;
    }
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toMatch(/FUNCTION_APP_URL/);
    expect(err?.message).toMatch(/API_AUDIENCE/);
    expect(err?.message).toMatch(/unset → production/);
  });

  it('passes silently when BACKEND_MODE=ui-review opts out of production gating, even with missing values', () => {
    expect(() =>
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: 'ui-review',
        functionAppUrl: '',
        apiAudience: '',
      }),
    ).not.toThrow();
  });

  it('passes silently for production my-dashboard when all required values are supplied', () => {
    expect(() =>
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: 'production',
        functionAppUrl: 'https://contoso-func.azurewebsites.net',
        apiAudience: 'api://contoso',
      }),
    ).not.toThrow();
  });

  it('passes silently for domains outside the required set, even when production-intended with missing values', () => {
    expect(() =>
      assertProductionRuntimeConfigRequirements({
        domainDir: 'project-control-center',
        backendMode: 'production',
        functionAppUrl: '',
        apiAudience: '',
      }),
    ).not.toThrow();
  });

  it('error message offers both fix paths (supply values OR opt out via ui-review)', () => {
    let err: Error | undefined;
    try {
      assertProductionRuntimeConfigRequirements({
        domainDir: 'my-dashboard',
        backendMode: 'production',
        functionAppUrl: '',
        apiAudience: '',
      });
    } catch (caught) {
      err = caught as Error;
    }
    expect(err?.message).toMatch(/BACKEND_MODE=ui-review/);
    expect(err?.message).toMatch(/non-secret runtime values/);
  });
});
