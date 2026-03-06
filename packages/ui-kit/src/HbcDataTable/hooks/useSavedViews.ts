/**
 * useSavedViews — Saved view CRUD + deep-link + offline cache
 * PH4.7 §7.3 Step 11 | PH4B.7 §4b.7.3 | Blueprint §1d
 *
 * Manages saved table view configurations with:
 *  - Create/read/update/delete operations
 *  - Storage adapter pattern for SPFx compatibility (F-022)
 *  - Deep-link URL generation and parsing (?view=base64)
 *  - View limit enforcement: max 20 personal per user per tool
 *
 * F-022: localStorage is blocked cross-origin in SPFx iframes.
 * Uses createStorageAdapter() to detect context and select:
 *  - SPFx → SessionStorageAdapter (cross-origin safe)
 *  - PWA/dev-harness → LocalStorageAdapter (existing behavior)
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  SavedViewConfig,
  SavedViewEntry,
  SavedViewsPersistenceAdapter,
} from '../saved-views-types.js';

const MAX_PERSONAL_VIEWS = 20;
const WARN_THRESHOLD = 18;

// ---------------------------------------------------------------------------
// SPFx context detection — F-022
// ---------------------------------------------------------------------------
function isSpfxContext(): boolean {
  try {
    return !!(
      (globalThis as Record<string, unknown>)._spPageContextInfo ||
      (globalThis as Record<string, unknown>).__spfxContext
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Storage adapters — PH4B.7 §4b.7.3
// ---------------------------------------------------------------------------
function getStorageKey(toolId: string, userId: string): string {
  return `hbc-saved-views-${toolId}-${userId}`;
}

/**
 * LocalStorageAdapter — default for PWA and dev-harness contexts.
 * Uses localStorage for persistent cross-session storage.
 */
class LocalStorageAdapter implements SavedViewsPersistenceAdapter {
  async load(toolId: string, userId: string): Promise<SavedViewEntry[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(getStorageKey(toolId, userId));
      return raw ? (JSON.parse(raw) as SavedViewEntry[]) : [];
    } catch {
      return [];
    }
  }

  async save(entry: SavedViewEntry): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(entry.toolId, entry.userId);
    try {
      const existing = localStorage.getItem(key);
      const views: SavedViewEntry[] = existing ? JSON.parse(existing) : [];
      const idx = views.findIndex((v) => v.id === entry.id);
      if (idx >= 0) {
        views[idx] = entry;
      } else {
        views.push(entry);
      }
      localStorage.setItem(key, JSON.stringify(views));
    } catch {
      // Storage quota exceeded or unavailable — silent fail
    }
  }

  async remove(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    // Scan all keys to find and remove the entry
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('hbc-saved-views-')) continue;
      try {
        const views: SavedViewEntry[] = JSON.parse(localStorage.getItem(key) ?? '[]');
        const filtered = views.filter((v) => v.id !== id);
        if (filtered.length !== views.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          return;
        }
      } catch {
        continue;
      }
    }
  }
}

/**
 * SessionStorageAdapter — for SPFx iframe contexts (F-022).
 * sessionStorage is cross-origin safe in SPFx iframes unlike localStorage.
 * Data persists for the browser tab session only.
 * Full SharePoint REST API adapter deferred to Phase 5 (backend dependency).
 */
class SessionStorageAdapter implements SavedViewsPersistenceAdapter {
  async load(toolId: string, userId: string): Promise<SavedViewEntry[]> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(getStorageKey(toolId, userId));
      return raw ? (JSON.parse(raw) as SavedViewEntry[]) : [];
    } catch {
      return [];
    }
  }

  async save(entry: SavedViewEntry): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(entry.toolId, entry.userId);
    try {
      const existing = sessionStorage.getItem(key);
      const views: SavedViewEntry[] = existing ? JSON.parse(existing) : [];
      const idx = views.findIndex((v) => v.id === entry.id);
      if (idx >= 0) {
        views[idx] = entry;
      } else {
        views.push(entry);
      }
      sessionStorage.setItem(key, JSON.stringify(views));
    } catch {
      // Storage quota exceeded or unavailable — silent fail
    }
  }

  async remove(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith('hbc-saved-views-')) continue;
      try {
        const views: SavedViewEntry[] = JSON.parse(sessionStorage.getItem(key) ?? '[]');
        const filtered = views.filter((v) => v.id !== id);
        if (filtered.length !== views.length) {
          sessionStorage.setItem(key, JSON.stringify(filtered));
          return;
        }
      } catch {
        continue;
      }
    }
  }
}

/**
 * Factory: selects the appropriate storage adapter based on runtime context.
 * SPFx iframe → SessionStorageAdapter (F-022)
 * PWA / dev-harness → LocalStorageAdapter
 */
export function createStorageAdapter(): SavedViewsPersistenceAdapter {
  return isSpfxContext() ? new SessionStorageAdapter() : new LocalStorageAdapter();
}

// ---------------------------------------------------------------------------
// ID generator
// ---------------------------------------------------------------------------
function generateId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------
export interface UseSavedViewsOptions {
  toolId: string;
  userId: string;
  projectId?: string;
  /** Optional custom adapter — defaults to createStorageAdapter() */
  adapter?: SavedViewsPersistenceAdapter;
}

export interface UseSavedViewsReturn {
  views: SavedViewEntry[];
  activeView: SavedViewEntry | null;
  createView: (
    name: string,
    config: SavedViewConfig,
    scope?: SavedViewEntry['scope'],
  ) => SavedViewEntry | null;
  updateView: (id: string, updates: Partial<Pick<SavedViewEntry, 'name' | 'config' | 'isDefault'>>) => void;
  deleteView: (id: string) => void;
  activateView: (id: string | null) => void;
  getDeepLink: (config: SavedViewConfig) => string;
  configFromUrl: SavedViewConfig | null;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------
export function useSavedViews({
  toolId,
  userId,
  projectId,
  adapter: customAdapter,
}: UseSavedViewsOptions): UseSavedViewsReturn {
  const adapter = useMemo(
    () => customAdapter ?? createStorageAdapter(),
    [customAdapter],
  );

  const [views, setViews] = useState<SavedViewEntry[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load views from adapter on mount
  useEffect(() => {
    let cancelled = false;
    adapter.load(toolId, userId, projectId).then((loaded) => {
      if (!cancelled) {
        setViews(loaded);
        setInitialized(true);
      }
    });
    return () => { cancelled = true; };
  }, [adapter, toolId, userId, projectId]);

  // Parse deep-link URL on mount
  const configFromUrl = useMemo<SavedViewConfig | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (!viewParam) return null;
      return JSON.parse(atob(viewParam)) as SavedViewConfig;
    } catch {
      return null;
    }
  }, []);

  const personalViewCount = views.filter(
    (v) => v.scope === 'personal' && v.userId === userId,
  ).length;

  const createView = useCallback(
    (
      name: string,
      config: SavedViewConfig,
      scope: SavedViewEntry['scope'] = 'personal',
    ): SavedViewEntry | null => {
      if (scope === 'personal' && personalViewCount >= MAX_PERSONAL_VIEWS) {
        return null;
      }

      const entry: SavedViewEntry = {
        id: generateId(),
        userId,
        toolId,
        scope,
        projectId,
        name,
        config,
        isDefault: false,
      };

      setViews((prev) => [...prev, entry]);
      // Persist asynchronously
      adapter.save(entry);
      return entry;
    },
    [adapter, userId, toolId, projectId, personalViewCount],
  );

  const updateView = useCallback(
    (
      id: string,
      updates: Partial<Pick<SavedViewEntry, 'name' | 'config' | 'isDefault'>>,
    ) => {
      setViews((prev) => {
        const updated = prev.map((v) => {
          if (v.id !== id) {
            if (updates.isDefault && v.toolId === toolId) {
              return { ...v, isDefault: false };
            }
            return v;
          }
          return { ...v, ...updates };
        });
        // Persist the updated entry
        const entry = updated.find((v) => v.id === id);
        if (entry) adapter.save(entry);
        return updated;
      });
    },
    [adapter, toolId],
  );

  const deleteView = useCallback(
    (id: string) => {
      setViews((prev) => prev.filter((v) => v.id !== id));
      setActiveViewId((prev) => (prev === id ? null : prev));
      adapter.remove(id);
    },
    [adapter],
  );

  const activateView = useCallback((id: string | null) => {
    setActiveViewId(id);
  }, []);

  const getDeepLink = useCallback((config: SavedViewConfig): string => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('view', btoa(JSON.stringify(config)));
    return url.toString();
  }, []);

  const activeView = views.find((v) => v.id === activeViewId) ?? null;

  return {
    views,
    activeView,
    createView,
    updateView,
    deleteView,
    activateView,
    getDeepLink,
    configFromUrl,
    isNearLimit: personalViewCount >= WARN_THRESHOLD,
    isAtLimit: personalViewCount >= MAX_PERSONAL_VIEWS,
  };
}
