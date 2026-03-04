/**
 * useSavedViews — Saved view CRUD + deep-link + offline cache
 * PH4.7 §7.3 Step 11 | Blueprint §1d
 *
 * Manages saved table view configurations with:
 *  - Create/read/update/delete operations
 *  - localStorage persistence (stub adapter; real SharePoint/IndexedDB later)
 *  - Deep-link URL generation and parsing (?view=base64)
 *  - View limit enforcement: max 20 personal per user per tool
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  SavedViewConfig,
  SavedViewEntry,
} from '../saved-views-types.js';

const MAX_PERSONAL_VIEWS = 20;
const WARN_THRESHOLD = 18;

function getStorageKey(toolId: string, userId: string): string {
  return `hbc-saved-views-${toolId}-${userId}`;
}

function loadFromStorage(toolId: string, userId: string): SavedViewEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(toolId, userId));
    return raw ? (JSON.parse(raw) as SavedViewEntry[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(
  toolId: string,
  userId: string,
  views: SavedViewEntry[],
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(toolId, userId), JSON.stringify(views));
}

function generateId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseSavedViewsOptions {
  toolId: string;
  userId: string;
  projectId?: string;
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

export function useSavedViews({
  toolId,
  userId,
  projectId,
}: UseSavedViewsOptions): UseSavedViewsReturn {
  const [views, setViews] = useState<SavedViewEntry[]>(() =>
    loadFromStorage(toolId, userId),
  );
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  // Sync to localStorage on changes
  useEffect(() => {
    saveToStorage(toolId, userId, views);
  }, [views, toolId, userId]);

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
      return entry;
    },
    [userId, toolId, projectId, personalViewCount],
  );

  const updateView = useCallback(
    (
      id: string,
      updates: Partial<Pick<SavedViewEntry, 'name' | 'config' | 'isDefault'>>,
    ) => {
      setViews((prev) =>
        prev.map((v) => {
          if (v.id !== id) {
            // If setting a new default, unset other defaults for same tool
            if (updates.isDefault && v.toolId === toolId) {
              return { ...v, isDefault: false };
            }
            return v;
          }
          return { ...v, ...updates };
        }),
      );
    },
    [toolId],
  );

  const deleteView = useCallback((id: string) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
    setActiveViewId((prev) => (prev === id ? null : prev));
  }, []);

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
