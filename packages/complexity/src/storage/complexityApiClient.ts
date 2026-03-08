import type { IComplexityPreference } from '../types/IComplexityPreference';
import type { ComplexityTier } from '../types/IComplexity';
import { deriveInitialTier } from '../config/roleComplexityMap';

const PREFERENCES_ENDPOINT = '/api/users/me/preferences';
const AD_GROUPS_ENDPOINT = '/api/users/me/groups';

// ─────────────────────────────────────────────────────────────────────────────
// Fetch preference from API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the user's stored complexity preference from the API.
 * Returns null if the user has no stored preference (404 = new user).
 * Throws on unexpected errors (5xx, network failure).
 */
export async function fetchPreference(): Promise<IComplexityPreference | null> {
  const response = await fetch(PREFERENCES_ENDPOINT, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });

  if (response.status === 404) return null; // New user — no preference stored yet
  if (!response.ok) throw new Error(`[complexity] GET ${PREFERENCES_ENDPOINT} failed: ${response.status}`);

  const data = await response.json();
  return data as IComplexityPreference;
}

/**
 * Persists the complexity preference to the API (fire-and-forget in most call sites).
 * Returns the saved preference on success.
 * Does NOT throw — caller handles errors via the returned null.
 */
export async function patchPreference(pref: IComplexityPreference): Promise<IComplexityPreference | null> {
  try {
    const response = await fetch(PREFERENCES_ENDPOINT, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(pref),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[complexity] PATCH ${PREFERENCES_ENDPOINT} failed: ${response.status}`);
      }
      return null;
    }

    return await response.json() as IComplexityPreference;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] Failed to patch preference:', err);
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Role derivation for new users (D-02)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the authenticated user's Azure AD group memberships and derives
 * the initial complexity tier using the roleComplexityMap config (D-02).
 *
 * Called only for brand-new users (fetchPreference returned null).
 * The derived tier is immediately persisted via patchPreference.
 */
export async function deriveInitialTierFromADGroups(): Promise<ComplexityTier> {
  try {
    const response = await fetch(AD_GROUPS_ENDPOINT, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[complexity] GET ${AD_GROUPS_ENDPOINT} failed: ${response.status}. Using fallback tier 'standard'.`);
      }
      return 'standard';
    }

    const data = await response.json() as { groups: string[] };
    return deriveInitialTier(data.groups);
  } catch {
    // Network failure — use fallback
    return 'standard';
  }
}
