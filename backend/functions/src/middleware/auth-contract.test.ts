import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'glob';

/**
 * P3-05: Auth contract tests — verify that all HTTP route registration files
 * use withAuth() for JWT validation, with documented intentional exceptions.
 *
 * This is a static analysis test that scans source files to catch regressions
 * where a new route is added without auth protection.
 */

const FUNCTIONS_DIR = resolve(import.meta.dirname, '../functions');

/** Routes intentionally excluded from withAuth() requirement. */
const AUTH_EXCEPTIONS = new Set([
  'health',          // Health probe — unauthenticated by design
  'timerFullSpec',   // Timer trigger — not an HTTP route (Azure Functions timer)
  'cleanupIdempotency', // Timer trigger — not an HTTP route
  'notifications',   // Internal notification delivery — may use different auth model
]);

describe('P3-05 Route auth enforcement contract', () => {
  const routeFiles = globSync('*/index.ts', { cwd: FUNCTIONS_DIR });

  it('finds route registration files', () => {
    expect(routeFiles.length).toBeGreaterThan(10);
  });

  it('all HTTP route files use withAuth() or are documented exceptions', () => {
    const unprotectedRoutes: string[] = [];

    for (const file of routeFiles) {
      const dirName = file.split('/')[0];
      if (AUTH_EXCEPTIONS.has(dirName)) continue;

      const content = readFileSync(resolve(FUNCTIONS_DIR, file), 'utf-8');

      // Skip non-HTTP route files (timer triggers, etc.)
      if (!content.includes('app.http(')) continue;

      // Check that withAuth is imported and used
      if (!content.includes('withAuth')) {
        unprotectedRoutes.push(dirName);
      }
    }

    expect(
      unprotectedRoutes,
      `These route modules register HTTP handlers without withAuth(): ${unprotectedRoutes.join(', ')}. ` +
      'Either wrap handlers with withAuth() or add the module to AUTH_EXCEPTIONS with justification.',
    ).toEqual([]);
  });

  it('proxy routes are now protected with withAuth()', () => {
    const proxyIndex = readFileSync(resolve(FUNCTIONS_DIR, 'proxy/index.ts'), 'utf-8');
    expect(proxyIndex).toContain('withAuth');
    expect(proxyIndex).toContain("import { withAuth }");
  });

  it('health endpoint does NOT use withAuth() (intentional exception)', () => {
    const healthIndex = readFileSync(resolve(FUNCTIONS_DIR, 'health/index.ts'), 'utf-8');
    expect(healthIndex).not.toContain('withAuth');
  });
});
