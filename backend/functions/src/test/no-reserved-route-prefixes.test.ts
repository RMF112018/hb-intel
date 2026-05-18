import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Azure Functions reserved-prefix invariant.
 *
 * Azure Functions reserves `admin/`, `runtime/`, `host/`, and `debug/` as
 * built-in management-plane route prefixes. Registering an `app.http(...)`
 * with a `route:` literal that begins with one of these prefixes causes the
 * host to emit
 *
 *   "The specified route conflicts with one or more built in routes."
 *
 * at startup, and the affected function is not registered. The conflict
 * check is performed against the `route:` argument verbatim, regardless of
 * the configured `extensions.http.routePrefix` (`"api"` in this repo).
 *
 * Posture:
 *
 *   - `runtime/`, `host/`, and `debug/` are strictly disallowed.
 *   - `admin/` is a known tech-debt prefix with a substantial existing
 *     footprint shipping today. Eliminating those routes requires a
 *     coordinated rename across the backend AND the consuming admin SPFx
 *     UI / hb-webparts client. That migration is tracked as a follow-up
 *     and is intentionally NOT in scope for this patch. To prevent
 *     additional regressions while the migration is pending, the test
 *     **carve-out** snapshots the exact set of `admin/` route literals
 *     currently registered. Any new `admin/` route added in the future
 *     fails this test; deletions are welcome (update the snapshot in the
 *     same patch).
 *
 * Carve-out rationale (residual tech debt, follow-up tracked):
 *   The 7 `admin/legacy-fallback/...` registrations that were the
 *   immediate trigger for the host startup conflict log have already been
 *   renamed to `admin-api/legacy-fallback/...`. The remaining `admin/...`
 *   registrations below predate the conflict-aware invariant. They will
 *   continue to emit the startup log line until the coordinated
 *   admin-UI / hb-webparts rename ships. This test does not unblock that
 *   work — it pins the boundary so the residual footprint cannot grow.
 */

const FUNCTIONS_SRC = resolve(import.meta.dirname, '..');

const STRICTLY_DISALLOWED_PREFIXES = ['runtime/', 'host/', 'debug/'] as const;
const TECH_DEBT_PREFIX = 'admin/' as const;

const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '__tests__',
  '__mocks__',
]);

const ROUTE_LITERAL_PATTERN = /\broute\s*:\s*(['"])([^'"]+)\1/g;

/**
 * Snapshot of pre-existing `admin/...` route literals that the Azure
 * Functions host already reports as reserved-prefix conflicts today.
 * These are intentionally permitted by this invariant until the
 * coordinated backend + admin-UI rename ships under the dedicated
 * follow-up. New `admin/...` registrations outside this set must fail.
 *
 * Sorted, deduplicated. Update only when a route is REMOVED.
 */
const PERMITTED_ADMIN_TECH_DEBT_ROUTES: ReadonlySet<string> = new Set([
  'admin/actions',
  'admin/apps/bindings',
  'admin/apps/{appId}/binding',
  'admin/apps/{appId}/binding/publish',
  'admin/apps/{appId}/binding/repair',
  'admin/apps/{appId}/binding/verify',
  'admin/audit',
  'admin/config/{scope}',
  'admin/connections',
  'admin/connections/{connectorId}/history',
  'admin/connections/{connectorId}/policy',
  'admin/connections/{connectorId}/test',
  'admin/identity/users',
  'admin/identity/users/search',
  'admin/identity/users/{userId}',
  'admin/identity/users/{userId}/disable',
  'admin/identity/users/{userId}/enable',
  'admin/my-projects-projection/rebuild',
  'admin/my-projects-projection/seed',
  'admin/my-projects-projection/status',
  'admin/my-projects-projection/subscriptions/reconcile',
  'admin/observability/alerts',
  'admin/observability/alerts/ingest',
  'admin/observability/alerts/summary',
  'admin/observability/alerts/{alertId}',
  'admin/observability/alerts/{alertId}/acknowledge',
  'admin/observability/alerts/{alertId}/resolve',
  'admin/observability/dashboard',
  'admin/observability/errors',
  'admin/observability/errors/ingest',
  'admin/observability/errors/{errorId}',
  'admin/observability/probes/health',
  'admin/observability/probes/history',
  'admin/observability/probes/latest',
  'admin/observability/probes/snapshots',
  'admin/observability/timeline/{runId}',
  'admin/preflight',
  'admin/runs',
  'admin/runs/preview',
  'admin/runs/{runId}',
  'admin/runs/{runId}/artifacts/{evidenceId}/download',
  'admin/runs/{runId}/audit',
  'admin/runs/{runId}/cancel',
  'admin/runs/{runId}/checkpoint',
  'admin/runs/{runId}/evidence',
  'admin/runs/{runId}/retry',
  'admin/trigger-timer',
  'admin/white-glove/devices/{deviceRunId}',
  'admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId}',
  'admin/white-glove/devices/{deviceRunId}/retry',
  'admin/white-glove/runs',
  'admin/white-glove/runs/{runId}',
  'admin/white-glove/runs/{runId}/cancel',
  'admin/white-glove/runs/{runId}/retry',
]);

interface RouteOccurrence {
  readonly file: string;
  readonly line: number;
  readonly route: string;
}

function walkTypeScriptFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry)) continue;
      walkTypeScriptFiles(full, acc);
      continue;
    }
    if (!entry.endsWith('.ts')) continue;
    if (entry.endsWith('.test.ts')) continue;
    if (entry.endsWith('.d.ts')) continue;
    acc.push(full);
  }
  return acc;
}

function collectRouteOccurrences(): RouteOccurrence[] {
  const files = walkTypeScriptFiles(FUNCTIONS_SRC);
  const out: RouteOccurrence[] = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      ROUTE_LITERAL_PATTERN.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = ROUTE_LITERAL_PATTERN.exec(line)) !== null) {
        out.push({ file, line: i + 1, route: match[2] });
      }
    }
  }
  return out;
}

const relative = (file: string): string =>
  file.startsWith(FUNCTIONS_SRC) ? file.slice(FUNCTIONS_SRC.length + 1) : file;

describe('Azure Functions reserved-route-prefix invariant', () => {
  const occurrences = collectRouteOccurrences();

  it('finds at least one route literal (sanity — the scan is not silently empty)', () => {
    expect(occurrences.length).toBeGreaterThan(0);
  });

  it('never registers a route whose literal begins with runtime/, host/, or debug/', () => {
    const conflicts: string[] = [];
    for (const occ of occurrences) {
      for (const prefix of STRICTLY_DISALLOWED_PREFIXES) {
        if (occ.route.startsWith(prefix)) {
          conflicts.push(
            `${relative(occ.file)}:${occ.line} → route: '${occ.route}' (begins with reserved '${prefix}')`,
          );
          break;
        }
      }
    }
    expect(conflicts, `Azure Functions reserved-prefix conflict: ${conflicts.join('; ')}`).toEqual(
      [],
    );
  });

  it('blocks NEW admin/ route registrations (carve-out: only the documented existing set is permitted)', () => {
    const newConflicts: string[] = [];
    for (const occ of occurrences) {
      if (!occ.route.startsWith(TECH_DEBT_PREFIX)) continue;
      if (PERMITTED_ADMIN_TECH_DEBT_ROUTES.has(occ.route)) continue;
      newConflicts.push(
        `${relative(occ.file)}:${occ.line} → route: '${occ.route}' (NEW admin/ route — not in PERMITTED_ADMIN_TECH_DEBT_ROUTES carve-out)`,
      );
    }
    if (newConflicts.length > 0) {
      throw new Error(
        `New Azure Functions reserved-prefix (admin/) registration detected. ` +
          `Rename to a non-reserved prefix (e.g., 'admin-api/...') OR add a deliberate exception entry ` +
          `to PERMITTED_ADMIN_TECH_DEBT_ROUTES with rationale and tracked migration owner.\n\n` +
          newConflicts.map((l) => `  - ${l}`).join('\n'),
      );
    }
    expect(newConflicts).toEqual([]);
  });

  it('keeps the legacy-fallback admin routes under the non-reserved admin-api/ prefix', () => {
    const legacyFallback = occurrences.filter((occ) => occ.route.includes('legacy-fallback/'));
    expect(legacyFallback.length).toBeGreaterThanOrEqual(7);
    for (const occ of legacyFallback) {
      expect(
        occ.route.startsWith('admin-api/legacy-fallback/'),
        `legacy-fallback route at ${relative(occ.file)}:${occ.line} regressed to '${occ.route}' — must remain under 'admin-api/legacy-fallback/'`,
      ).toBe(true);
    }
  });

  it('flags the residual admin/ tech-debt footprint deterministically (informational; tracked follow-up)', () => {
    const adminTechDebt = occurrences
      .filter((occ) => occ.route.startsWith(TECH_DEBT_PREFIX))
      .map((occ) => occ.route);
    const unique = Array.from(new Set(adminTechDebt));
    // Pinning the deduplicated unique count lets the next migration patch
    // observe drift the moment any of these routes are removed.
    expect(unique.sort()).toEqual(Array.from(PERMITTED_ADMIN_TECH_DEBT_ROUTES).sort());
  });
});
