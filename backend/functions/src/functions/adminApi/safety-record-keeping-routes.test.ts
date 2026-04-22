import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROUTE_FILE = resolve(import.meta.dirname, 'safety-record-keeping-routes.ts');

describe('admin safety record-keeping provisioning route wiring', () => {
  const source = readFileSync(ROUTE_FILE, 'utf-8');

  it('registers the expected handler key and route', () => {
    expect(source).toContain("'adminProvisionSafetyRecordKeepingSharePoint'");
    expect(source).toContain("route: 'admin/safety-records/provision-sharepoint'");
    expect(source).toContain("methods: ['POST']");
    expect(source).toContain("'safetyIngestWorkbook'");
    expect(source).toContain("route: 'admin/safety-records/ingest'");
  });

  it('uses standard auth posture (delegated scope + admin)', () => {
    expect(source).toContain('withAuth(');
    expect(source).toContain('requireDelegatedScope');
    expect(source).toContain('requireAdmin');
  });

  it('routes through the existing app-only sharepoint service lane', () => {
    expect(source).toContain('SharePointService');
    expect(source).toContain('MockSharePointService');
    expect(source).toContain('provisionSafetyRecordKeepingSharePoint');
    expect(source).toContain('ingestSafetyWorkbook');
  });

  it('supports dryRun request body input', () => {
    expect(source).toContain('dryRun');
  });
});
