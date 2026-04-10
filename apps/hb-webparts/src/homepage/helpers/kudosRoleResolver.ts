/**
 * HB Kudos role resolver — Phase-14 kudos/ Prompt-05.
 *
 * Resolves the current user's `KudosRole` from the webpart property
 * configuration. In production the `kudosAdminsGroup` /
 * `kudosReviewersGroup` properties contain SharePoint group names;
 * this resolver queries the current user's group membership via the
 * REST API and returns `admin`, `reviewer`, or `viewer` accordingly.
 *
 * When the site URL is unavailable (local dev / packaging preview),
 * falls back to the `simulatedRole` webpart property so the UI
 * gates remain exercisable outside SharePoint.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-05-Permissions-Notifications-and-Work-Management.md`
 */
import type { KudosRole } from './kudosCapabilities.js';
import { parseKudosRole } from './kudosCapabilities.js';

/** Cache resolved role per site+user pair for the session duration. */
let _cachedRole: { siteUrl: string; email: string; role: KudosRole } | undefined;

/**
 * Check whether the current user belongs to a specific SharePoint
 * group by name. Uses `/_api/web/sitegroups/getbyname('...')/users`
 * and compares the current user's login name against the members.
 */
async function isCurrentUserInGroup(
  siteUrl: string,
  groupName: string,
): Promise<boolean> {
  if (!groupName.trim()) return false;
  try {
    const url = `${siteUrl}/_api/web/currentuser`;
    const userRes = await fetch(url, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (!userRes.ok) return false;
    const userData = (await userRes.json()) as { LoginName?: string };
    const loginName = userData.LoginName;
    if (!loginName) return false;

    const groupUrl =
      `${siteUrl}/_api/web/sitegroups/getbyname('${encodeURIComponent(groupName)}')/users` +
      `?$filter=LoginName eq '${encodeURIComponent(loginName)}'&$top=1`;
    const groupRes = await fetch(groupUrl, {
      headers: { Accept: 'application/json;odata=nometadata' },
    });
    if (!groupRes.ok) return false;
    const groupData = (await groupRes.json()) as { value?: unknown[] };
    return (groupData.value?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export interface KudosRoleResolverConfig {
  siteUrl?: string;
  currentUserEmail?: string;
  kudosAdminsGroup?: string;
  kudosReviewersGroup?: string;
  simulatedRole?: unknown;
}

/**
 * Resolve the current user's `KudosRole` against live SharePoint
 * group membership. Falls back to `simulatedRole` when the site URL
 * is unavailable.
 *
 * Resolution order (first match wins):
 *   1. If the user is a member of `kudosAdminsGroup` → `admin`.
 *   2. If the user is a member of `kudosReviewersGroup` → `reviewer`.
 *   3. Otherwise → `viewer`.
 *
 * The result is cached for the session to avoid redundant REST calls
 * on every re-render.
 */
export async function resolveKudosRole(
  config: KudosRoleResolverConfig,
): Promise<KudosRole> {
  const siteUrl = config.siteUrl;
  const email = config.currentUserEmail ?? '';

  // No site URL → use the dev-mode simulated role.
  if (!siteUrl) {
    return parseKudosRole(config.simulatedRole);
  }

  // Return cached result when the same site + user is re-resolved.
  if (_cachedRole && _cachedRole.siteUrl === siteUrl && _cachedRole.email === email) {
    return _cachedRole.role;
  }

  let resolved: KudosRole = 'viewer';
  try {
    if (config.kudosAdminsGroup && await isCurrentUserInGroup(siteUrl, config.kudosAdminsGroup)) {
      resolved = 'admin';
    } else if (config.kudosReviewersGroup && await isCurrentUserInGroup(siteUrl, config.kudosReviewersGroup)) {
      resolved = 'reviewer';
    }
  } catch {
    // Group resolution failed — fall back to simulated role, failing
    // closed (viewer) when that is also absent.
    resolved = parseKudosRole(config.simulatedRole);
  }

  _cachedRole = { siteUrl, email, role: resolved };
  return resolved;
}

/** Clear the cached role (useful for testing). */
export function clearKudosRoleCache(): void {
  _cachedRole = undefined;
}
