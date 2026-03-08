# SF03-T06 — Persistence & Sync

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (getStorage), D-02 (role map config + loader), D-05 (StorageEvent), D-06 (lock), D-07 (showCoaching)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01, T02

---

## Objective

Implement all persistence and synchronization infrastructure: the storage abstraction (`getStorage`), the preference read/write client, the role-complexity mapping config and loader, and the Azure Functions API client for preference sync.

---

## 3-Line Plan

1. Implement `getStorage.ts` — detects PWA vs. SPFx context and returns `localStorage` or `sessionStorage`.
2. Implement `complexityStorage.ts` — reads and writes `IComplexityPreference` to the detected storage.
3. Implement `roleComplexityMap.ts` (config) and `complexityApiClient.ts` (API + role derivation).

---

## `src/storage/getStorage.ts`

```typescript
/**
 * Returns the appropriate Web Storage instance for the current runtime (D-01).
 *
 * PWA context:   localStorage  — persists across page reloads; fires StorageEvent to other tabs (D-05)
 * SPFx context:  sessionStorage — scoped to the SharePoint page session; no cross-tab StorageEvent
 *
 * Detection: the `isSpfx` flag is passed down from ComplexityProvider which receives
 * the `spfxContext` prop from the SPFx Application Customizer.
 *
 * Fallback: if the detected storage is unavailable (private browsing restrictions,
 * storage quota exceeded), returns an in-memory Map-backed storage implementation
 * so the provider never throws.
 */
export function getStorage(isSpfx: boolean): Storage {
  const preferred = isSpfx ? window.sessionStorage : window.localStorage;

  // Verify storage is accessible (some browsers restrict in certain iframe contexts)
  try {
    const testKey = '__hbc_storage_test__';
    preferred.setItem(testKey, '1');
    preferred.removeItem(testKey);
    return preferred;
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[complexity] ${isSpfx ? 'sessionStorage' : 'localStorage'} is unavailable. ` +
        'Falling back to in-memory storage — preferences will not persist across page reloads.'
      );
    }
    return createInMemoryStorage();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory fallback (private browsing / iframe sandbox restriction)
// ─────────────────────────────────────────────────────────────────────────────

function createInMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => { store.set(key, value); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (index) => Array.from(store.keys())[index] ?? null,
  };
}
```

---

## `src/storage/complexityStorage.ts`

```typescript
import type { IComplexityPreference } from '../types/IComplexityPreference';
import { COMPLEXITY_STORAGE_KEY } from '../types/IComplexityPreference';
import { getStorage } from './getStorage';

/**
 * Reads the stored complexity preference synchronously (D-01).
 * Returns null if no preference is stored (brand-new user).
 */
export function readPreference(isSpfx: boolean): IComplexityPreference | null {
  try {
    const raw = getStorage(isSpfx).getItem(COMPLEXITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IComplexityPreference;
    // Basic shape validation — reject corrupt values
    if (!parsed.tier || !['essential', 'standard', 'expert'].includes(parsed.tier)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes the complexity preference to storage (D-01).
 * Also fires the StorageEvent to other tabs (D-05) — this happens automatically
 * because localStorage.setItem triggers the native 'storage' event in other tabs.
 */
export function writePreference(pref: IComplexityPreference, isSpfx: boolean): void {
  try {
    getStorage(isSpfx).setItem(COMPLEXITY_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[complexity] Failed to persist preference to storage.');
    }
  }
}

/**
 * Clears the stored preference. Used in logout flows and tests.
 */
export function clearPreference(isSpfx: boolean): void {
  try {
    getStorage(isSpfx).removeItem(COMPLEXITY_STORAGE_KEY);
  } catch {
    // Silent — nothing to clear
  }
}
```

---

## `src/config/roleComplexityMap.ts`

```typescript
import type { IRoleComplexityConfig } from '../types/IComplexity';

/**
 * Role-to-complexity-tier mapping config (D-02).
 *
 * Edit this file to change the initial tier assigned to user groups on first login.
 * Changes take effect on the next first login for new users — existing users are unaffected
 * (their preference is already stored).
 *
 * Mappings are evaluated in order — first match wins.
 * The adGroup value must match the Azure AD security group display name exactly.
 *
 * To add a new role mapping:
 * 1. Add an entry to the `mappings` array below.
 * 2. Commit the change — no code deploy required beyond the config update.
 * 3. Document the change in docs/how-to/administrator/complexity-role-mapping.md.
 */
export const ROLE_COMPLEXITY_CONFIG: IRoleComplexityConfig = {
  mappings: [
    // ── Essential tier ──────────────────────────────────────────────────
    {
      adGroup: 'HBC-NewHire',
      initialTier: 'essential',
      description: 'New hires (< 90 days) — maximum coaching and simplified views',
    },
    {
      adGroup: 'HBC-FieldStaff',
      initialTier: 'essential',
      description: 'Field staff who primarily review, not manage, records',
    },
    {
      adGroup: 'HBC-Reviewer',
      initialTier: 'essential',
      description: 'External reviewers and occasional users',
    },

    // ── Standard tier ───────────────────────────────────────────────────
    {
      adGroup: 'HBC-ProjectCoordinator',
      initialTier: 'standard',
      description: 'Project coordinators — full operational view',
    },
    {
      adGroup: 'HBC-Admin',
      initialTier: 'standard',
      description: 'Administrative staff — full operational view',
    },
    {
      adGroup: 'HBC-ProjectManager',
      initialTier: 'standard',
      description: 'Project managers — full working view',
    },
    {
      adGroup: 'HBC-Estimator',
      initialTier: 'standard',
      description: 'Estimating team — full working view',
    },
    {
      adGroup: 'HBC-BusinessDevelopment',
      initialTier: 'standard',
      description: 'Business development team — full working view',
    },

    // ── Expert tier ─────────────────────────────────────────────────────
    {
      adGroup: 'HBC-Director',
      initialTier: 'expert',
      description: 'Directors — full information density',
    },
    {
      adGroup: 'HBC-VP',
      initialTier: 'expert',
      description: 'Vice Presidents — full information density',
    },
    {
      adGroup: 'HBC-Executive',
      initialTier: 'expert',
      description: 'Executive leadership — full information density',
    },
  ],

  /** Tier assigned when the user's AD groups match none of the above */
  fallbackTier: 'standard',
};

/**
 * Derives the initial complexity tier for a user from their Azure AD group memberships.
 * Returns the first matching tier, or fallbackTier if no match found.
 *
 * @param adGroups - Array of AD group display names from the user's token claims
 */
export function deriveInitialTier(adGroups: string[]): 'essential' | 'standard' | 'expert' {
  for (const mapping of ROLE_COMPLEXITY_CONFIG.mappings) {
    if (adGroups.includes(mapping.adGroup)) {
      return mapping.initialTier;
    }
  }
  return ROLE_COMPLEXITY_CONFIG.fallbackTier;
}
```

---

## `src/storage/complexityApiClient.ts`

```typescript
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
```

---

## `src/storage/index.ts`

```typescript
export { getStorage } from './getStorage';
export { readPreference, writePreference, clearPreference } from './complexityStorage';
```

---

## StorageEvent Cross-Tab Sync Note (D-05)

The cross-tab sync (D-05) is handled entirely within `ComplexityProvider` (T03) via the `window.addEventListener('storage', ...)` listener. The storage module's `writePreference` does not need any special code to trigger the event — it fires automatically in all other same-origin tabs when `localStorage.setItem` is called.

The flow for a cross-tab tier change:

```
Tab A: User clicks "Expert" in HbcComplexityDial
├── setTier('expert') called
├── writePreference({ tier: 'expert', ... }, false)
│   └── localStorage.setItem('hbc::complexity::v1', '{"tier":"expert",...}')
│       └── Browser fires 'storage' event in Tab B and Tab C (not Tab A)
├── patchPreference({ tier: 'expert', ... }) → PATCH /api/users/me/preferences (async)
└── Tab A context updates immediately

Tab B (and Tab C): storage event received
├── handleStorageEvent({ key: 'hbc::complexity::v1', newValue: '{"tier":"expert",...}' })
├── resolveExpiredLock(parsed) → no change (no lock)
└── setPreferenceState({ tier: 'expert', ... }) → React re-render at Expert
```

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/complexity typecheck

# 2. Storage unit tests (written in T08)
pnpm --filter @hbc/complexity test -- complexityStorage
pnpm --filter @hbc/complexity test -- getStorage

# 3. Role map smoke test
node -e "
  import('@hbc/complexity').then(m => {
    console.log(m.deriveInitialTier(['HBC-Director']));    // expert
    console.log(m.deriveInitialTier(['HBC-NewHire']));     // essential
    console.log(m.deriveInitialTier(['HBC-ProjectManager'])); // standard
    console.log(m.deriveInitialTier(['HBC-Unknown']));     // standard (fallback)
    console.log(m.deriveInitialTier([]));                  // standard (fallback)
  });
"
```
