/**
 * HB Kudos role resolver — production identity resolution.
 *
 * Resolves the current user's `KudosRole` from the real SharePoint
 * site permission model on the companion's host site
 * (`HBKudosAdminReview`).
 *
 * Production resolution strategy (strongest feasible path):
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
 *      group titles against the configured `kudosAdminsGroup` and
 *      `kudosReviewersGroup` values.
 *
 *   4. Fail closed to `viewer` when no match is found or when any
 *      error occurs.
 *
 * Dev-only fallback: when `siteUrl` is unavailable (local workbench
 * or jsdom tests), the `simulatedRole` webpart property is used
 * instead. This path is never active in live SharePoint.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix-Updated.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-04/Prompt-02-Identity-and-Permissions-Resolution.md`
 */
import type { KudosRole } from './kudosCapabilities.js';
import { parseKudosRole } from './kudosCapabilities.js';

/** Cache resolved role per site+user pair for the session duration. */
let _cachedRole: { siteUrl: string; email: string; role: KudosRole } | undefined;

/**
 * Resolve the current user's role from the site permission model.
 *
 * Uses a single `/_api/web/currentuser?$expand=Groups` call that
 * returns the user object with resolved group memberships (including
 * Entra security group nesting). Checks `IsSiteAdmin` first, then
 * matches group titles against the configured admin/reviewer group
 * names.
 */
async function resolveRoleFromSiteModel(
  siteUrl: string,
  kudosAdminsGroup: string | undefined,
  kudosReviewersGroup: string | undefined,
): Promise<KudosRole> {
  const userRes = await fetch(
    `${siteUrl}/_api/web/currentuser?$expand=Groups`,
    { headers: { Accept: 'application/json;odata=nometadata' } },
  );
  if (!userRes.ok) return 'viewer';

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

  // Explicit group-name resolution against the user's group memberships.
  if (kudosAdminsGroup && userGroupTitles.has(kudosAdminsGroup)) return 'admin';
  if (kudosReviewersGroup && userGroupTitles.has(kudosReviewersGroup)) return 'reviewer';

  return 'viewer';
}

export interface KudosRoleResolverConfig {
  siteUrl?: string;
  currentUserEmail?: string;
  kudosAdminsGroup?: string;
  kudosReviewersGroup?: string;
  /**
   * Dev-only: role to simulate when `siteUrl` is unavailable (local
   * workbench / jsdom tests). Ignored in live SharePoint — real site
   * permission model is queried instead.
   */
  simulatedRole?: unknown;
}

/**
 * Resolve the current user's `KudosRole` against the live SharePoint
 * site permission model.
 *
 * Production resolution order (first match wins):
 *   1. `IsSiteAdmin === true` → `admin`.
 *   2. User's group memberships include `kudosAdminsGroup` → `admin`.
 *   3. User's group memberships include `kudosReviewersGroup` → `reviewer`.
 *   4. Otherwise → `viewer` (fail closed).
 *
 * Falls back to `simulatedRole` only when `siteUrl` is unavailable
 * (local dev / jsdom tests). Never falls back to `simulatedRole`
 * when running in live SharePoint.
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
    resolved = await resolveRoleFromSiteModel(
      siteUrl,
      config.kudosAdminsGroup?.trim() || undefined,
      config.kudosReviewersGroup?.trim() || undefined,
    );
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
