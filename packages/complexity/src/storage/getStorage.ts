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
