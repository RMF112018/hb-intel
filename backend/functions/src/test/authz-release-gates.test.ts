import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * P9-G5-11: Authorization model release gates.
 *
 * Machine-checkable proofs that the Gap 5 authorization convergence is
 * enforced and cannot silently regress to the old env-based UPN model.
 *
 * These are static analysis tests — they scan source files at test time,
 * not at runtime. A failing gate means someone reintroduced a pattern
 * that the Gap 5 convergence was designed to eliminate.
 */

const SRC_DIR = resolve(import.meta.dirname, '..');

function readSrc(relPath: string): string {
  return readFileSync(resolve(SRC_DIR, relPath), 'utf-8');
}

// ── Gate 1: No env-var UPN authorization in request lifecycle ─────────────

describe('G5-Gate-1: request lifecycle does not use env-var UPN authorization', () => {
  it('state-machine.ts does not reference ADMIN_UPNS or CONTROLLER_UPNS', () => {
    const content = readSrc('state-machine.ts');
    expect(content).not.toContain('ADMIN_UPNS');
    expect(content).not.toContain('CONTROLLER_UPNS');
  });

  it('projectRequests/index.ts does not reference ADMIN_UPNS or CONTROLLER_UPNS', () => {
    const content = readSrc('functions/projectRequests/index.ts');
    expect(content).not.toContain('ADMIN_UPNS');
    expect(content).not.toContain('CONTROLLER_UPNS');
  });

  it('resolveRequestRole accepts IValidatedClaims, not a UPN string', () => {
    const content = readSrc('state-machine.ts');
    // Must accept claims object, not a bare string
    expect(content).toMatch(/resolveRequestRole\(\s*\n?\s*claims:\s*IValidatedClaims/);
    // Must import from authorization module
    expect(content).toContain("from './middleware/authorization.js'");
  });
});

// ── Gate 2: All provisioning routes enforce delegated scope ───────────────

describe('G5-Gate-2: provisioning routes enforce delegated scope', () => {
  it('provisioningSaga/index.ts imports requireDelegatedScope', () => {
    const content = readSrc('functions/provisioningSaga/index.ts');
    expect(content).toContain('requireDelegatedScope');
  });

  it('every handler block in provisioningSaga calls requireDelegatedScope', () => {
    const content = readSrc('functions/provisioningSaga/index.ts');
    // Count app.http registrations
    const routeCount = (content.match(/app\.http\(/g) || []).length;
    // Count requireDelegatedScope calls
    const scopeCheckCount = (content.match(/requireDelegatedScope\(/g) || []).length;
    // Every route should have a scope check
    expect(scopeCheckCount).toBeGreaterThanOrEqual(routeCount);
  });

  it('provisioningSaga/index.ts imports requireAdmin from shared policy engine', () => {
    const content = readSrc('functions/provisioningSaga/index.ts');
    expect(content).toContain("from '../../middleware/authorization.js'");
    expect(content).toContain('requireAdmin');
  });

  it('provisioningSaga/index.ts does not contain inline admin role checks', () => {
    const content = readSrc('functions/provisioningSaga/index.ts');
    // The old pattern: auth.claims.roles.some((role) => role === 'Admin'
    expect(content).not.toMatch(/auth\.claims\.roles\.some/);
  });
});

// ── Gate 3: Shared policy engine is the single authorization source ───────

describe('G5-Gate-3: authorization decisions use shared policy engine', () => {
  it('authorization.ts exports canonical role constants', () => {
    const content = readSrc('middleware/authorization.ts');
    expect(content).toContain('ADMIN_ROLES');
    expect(content).toContain('CONTROLLER_ROLES');
    expect(content).toContain('BREAK_GLASS_ROLES');
    expect(content).toContain('AUTOMATION_ROLES');
    expect(content).toContain('PRIVILEGED_ROLES');
  });

  it('authorization.ts exports ownership check with oid-first semantics', () => {
    const content = readSrc('middleware/authorization.ts');
    expect(content).toContain('checkOwnership');
    expect(content).toContain('submittedByOid');
  });

  it('authorization.ts exports telemetry helper', () => {
    const content = readSrc('middleware/authorization.ts');
    expect(content).toContain('emitAuthorizationTelemetry');
    expect(content).toContain('authz.break_glass');
  });

  it('authorization.ts exports Safety route policy contract', () => {
    const content = readSrc('middleware/authorization.ts');
    expect(content).toContain('SAFETY_SUBMITTER_ROLES');
    expect(content).toContain('SAFETY_OPERATOR_ROLES');
    expect(content).toContain('SAFETY_REVIEWER_ROLES');
    expect(content).toContain('SAFETY_ADMIN_ROLES');
    expect(content).toContain('SAFETY_GLOBAL_OVERRIDE_ROLES');
    expect(content).toContain('authorizeSafetyRoute');
    expect(content).toContain('workload-automation');
  });

  it('signalr/index.ts uses shared ADMIN_ROLES, not local constant', () => {
    const content = readSrc('functions/signalr/index.ts');
    expect(content).toContain("from '../../middleware/authorization.js'");
    // Should not define its own ADMIN_ROLES
    expect(content).not.toMatch(/^const ADMIN_ROLES/m);
  });
});

// ── Gate 4: Stable identity fields in models ──────────────────────────────

describe('G5-Gate-4: stable identity (oid) fields present in handlers', () => {
  it('submitProjectSetupRequest captures submittedByOid', () => {
    const content = readSrc('functions/projectRequests/index.ts');
    expect(content).toContain('submittedByOid: auth.claims.oid');
  });

  it('advanceRequestState captures completedByOid on completion', () => {
    const content = readSrc('functions/projectRequests/index.ts');
    expect(content).toContain('completedByOid');
  });

  it('provisionProjectSite captures triggeredByOid', () => {
    const content = readSrc('functions/provisioningSaga/index.ts');
    expect(content).toContain('triggeredByOid');
  });

  it('table storage service persists oid fields', () => {
    const content = readSrc('services/table-storage-service.ts');
    expect(content).toContain('triggeredByOid');
    expect(content).toContain('submittedByOid');
  });
});

// ── Gate 5: Token validation supports app-only tokens ─────────────────────

describe('G5-Gate-5: validateToken supports app-only tokens', () => {
  it('IValidatedClaims includes scp and idtyp fields', () => {
    const content = readSrc('middleware/validateToken.ts');
    expect(content).toContain('scp?:');
    expect(content).toContain('idtyp?:');
  });

  it('validateToken relaxes upn requirement for app-only tokens', () => {
    const content = readSrc('middleware/validateToken.ts');
    expect(content).toContain('isAppOnly');
    // Should not unconditionally require upn
    expect(content).not.toMatch(/if\s*\(\s*!upn\s*\|\|\s*!claims\.oid\s*\)/);
  });
});

// ── Gate 6: Break-glass telemetry is wired ────────────────────────────────

describe('G5-Gate-6: break-glass telemetry wired in role resolution', () => {
  it('resolveRequestRole emits telemetry for BreakGlass', () => {
    const content = readSrc('state-machine.ts');
    expect(content).toContain('isBreakGlass');
    expect(content).toContain('emitAuthorizationTelemetry');
    expect(content).toContain('isBreakGlass: true');
  });

  it('resolveRequestRole accepts optional logger parameter', () => {
    const content = readSrc('state-machine.ts');
    expect(content).toMatch(/logger\?:\s*ILogger/);
  });
});
