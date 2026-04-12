/**
 * HB Kudos role resolver — production identity resolution.
 *
 * Resolves the current user's `KudosRole` from the real SharePoint
 * site permission model on the companion's host site
 * (`HBKudosAdminReview`).
 *
 * Production permissions resolve solely from Entra ID security group
 * membership. The canonical production groups are hardcoded:
 *   - `HB Kudos Admins`  → admin role
 *   - `HB Kudos Reviewers` → reviewer role
 *
 * These are not configurable per webpart instance. The property pane
 * is not a permissions-authority surface.
 *
 * Production resolution strategy:
 *
 *   1. Fetch `/_api/web/currentuser?$expand=Groups` — a single REST
 *      call that returns the current user object with their resolved
 *      group memberships. SharePoint Online resolves Entra security
 *      groups nested inside SharePoint site groups, so this works
 *      regardless of whether the configured groups are native
 *      SharePoint groups or Entra-linked groups.
 *
 *   2. Check `IsSiteAdmin` — if the current user is a site collection
 *      administrator (the role assigned to `HB Kudos Admins` on the
 *      production admin site), resolve immediately as `admin`.
 *
 *   3. Check group membership by title — compare the user's resolved
 *      group titles against the canonical admin/reviewer group names.
 *
 *   4. Fail closed to `viewer` when no match is found or when any
 *      error occurs.
 *
 * Dev-only fallback: when `siteUrl` is unavailable (local workbench
 * or jsdom tests), the `simulatedRole` property is used instead.
 * This path is never active in live SharePoint.
 *
 * Governing source:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix-Updated.md`
 */
import type { KudosRole } from './kudosCapabilities.js';
import { parseKudosRole } from './kudosCapabilities.js';

/**
 * Canonical Entra security groups — the sole production permission
 * authority. Not configurable per webpart instance.
 */
const KUDOS_ADMINS_GROUP = 'HB Kudos Admins';
const KUDOS_REVIEWERS_GROUP = 'HB Kudos Reviewers';

/** Cache resolved role per site+user pair for the session duration. */
let _cachedRole: { siteUrl: string; email: string; role: KudosRole } | undefined;

/**
 * Resolve the current user's role from the site permission model.
 *
 * Uses a single `/_api/web/currentuser?$expand=Groups` call that
 * returns the user object with resolved group memberships (including
 * Entra security group nesting). Checks `IsSiteAdmin` first, then
 * matches group titles against the canonical admin/reviewer group
 * names.
 */
async function resolveRoleFromSiteModel(
  siteUrl: string,
): Promise<KudosRole> {
  const userRes = await fetch(
    `${siteUrl}/_api/web/currentuser?$expand=Groups`,
    { headers: { Accept: 'application/json;odata=nometadata' } },
  );
  // Non-OK responses are classified as degraded infra failures. The
  // outer `resolveKudosRole` catches and fails closed to viewer for
  // backward compatibility; `resolveKudosRoleStatus` reports
  // `resolution-failed` so the UI can render a dedicated degraded
  // state instead of a misleading "Access restricted" message.
  if (!userRes.ok) {
    throw new Error(`currentuser lookup failed: HTTP ${userRes.status}`);
  }

  const userData = (await userRes.json()) as {
    IsSiteAdmin?: boolean;
    Groups?: Array<{ Title?: string }>;
  };

  // Site collection administrator → admin role. This directly maps to
  // the production model where HB Kudos Admins is the site Admin.
  if (userData.IsSiteAdmin) return 'admin';

  // Build a set of group titles for O(1) membership lookup.
  const userGroupTitles = new Set(
    (userData.Groups ?? [])
      .map((g) => g.Title)
      .filter((t): t is string => typeof t === 'string'),
  );

  // Canonical group-name resolution against the user's group memberships.
  if (userGroupTitles.has(KUDOS_ADMINS_GROUP)) return 'admin';
  if (userGroupTitles.has(KUDOS_REVIEWERS_GROUP)) return 'reviewer';

  return 'viewer';
}

export interface KudosRoleResolverConfig {
  siteUrl?: string;
  currentUserEmail?: string;
  /**
   * Dev-only: role to simulate when `siteUrl` is unavailable (local
   * workbench / jsdom tests). Ignored in live SharePoint — real site
   * permission model is queried instead. Not exposed in the production
   * property pane.
   */
  simulatedRole?: unknown;
}

/**
 * Resolve the current user's `KudosRole` against the live SharePoint
 * site permission model.
 *
 * Production resolution order (first match wins):
 *   1. `IsSiteAdmin === true` → `admin`.
 *   2. User's group memberships include `HB Kudos Admins` → `admin`.
 *   3. User's group memberships include `HB Kudos Reviewers` → `reviewer`.
 *   4. Otherwise → `viewer` (fail closed).
 *
 * Group names are canonical constants, not configurable per instance.
 *
 * Falls back to `simulatedRole` only when `siteUrl` is unavailable
 * (local dev / jsdom tests). Never falls back in live SharePoint.
 *
 * The result is cached for the session to avoid redundant REST calls
 * on every re-render.
 */
export async function resolveKudosRole(
  config: KudosRoleResolverConfig,
): Promise<KudosRole> {
  const siteUrl = config.siteUrl;
  const email = config.currentUserEmail ?? '';

  // No site URL → dev-mode simulated role.
  if (!siteUrl) {
    return parseKudosRole(config.simulatedRole);
  }

  // Return cached result when the same site + user is re-resolved.
  if (_cachedRole && _cachedRole.siteUrl === siteUrl && _cachedRole.email === email) {
    return _cachedRole.role;
  }

  let resolved: KudosRole = 'viewer';
  try {
    resolved = await resolveRoleFromSiteModel(siteUrl);
  } catch {
    // Site permission resolution failed — fail closed to viewer.
    // Do NOT fall back to simulatedRole when siteUrl is present.
    resolved = 'viewer';
  }

  _cachedRole = { siteUrl, email, role: resolved };
  return resolved;
}

/** Clear the cached role (useful for testing). */
export function clearKudosRoleCache(): void {
  _cachedRole = undefined;
}

/**
 * Resolution status — distinguishes a real production permission
 * resolution from a degraded one so the Companion can render a
 * dedicated "permission check failed" state instead of misleading
 * "Access restricted" copy.
 *
 * - `resolved`         : live site-model query succeeded (or user is a
 *                        legitimate viewer). Standard capability flow.
 * - `resolution-failed`: site-model query threw or returned non-OK in a
 *                        production context (siteUrl present). Role
 *                        falls closed to `viewer` but the workspace
 *                        must NOT claim the user simply lacks access.
 * - `simulated`        : no siteUrl (local dev / jsdom harness) — the
 *                        `simulatedRole` property was used. Allowed.
 */
export type KudosRoleResolutionStatus =
  | 'resolved'
  | 'resolution-failed'
  | 'simulated';

export interface KudosRoleResolution {
  role: KudosRole;
  status: KudosRoleResolutionStatus;
}

/**
 * Same resolution as `resolveKudosRole` but returns a richer result
 * that exposes whether the live site-model query failed. Callers that
 * need to render a degraded-permission-check state use this; callers
 * that only need the role continue using `resolveKudosRole`.
 */
export async function resolveKudosRoleStatus(
  config: KudosRoleResolverConfig,
): Promise<KudosRoleResolution> {
  const siteUrl = config.siteUrl;
  const email = config.currentUserEmail ?? '';

  if (!siteUrl) {
    return { role: parseKudosRole(config.simulatedRole), status: 'simulated' };
  }

  if (_cachedRole && _cachedRole.siteUrl === siteUrl && _cachedRole.email === email) {
    return { role: _cachedRole.role, status: 'resolved' };
  }

  try {
    const resolved = await resolveRoleFromSiteModel(siteUrl);
    _cachedRole = { siteUrl, email, role: resolved };
    return { role: resolved, status: 'resolved' };
  } catch {
    // Do NOT cache — the next attempt should retry the live query.
    return { role: 'viewer', status: 'resolution-failed' };
  }
}
